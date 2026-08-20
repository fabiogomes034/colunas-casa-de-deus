from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
from pathlib import Path
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Auth config
ADMIN_USERNAME = os.environ['ADMIN_USERNAME']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
JWT_SECRET = os.environ['JWT_SECRET_KEY']
JWT_EXPIRE_MINUTES = int(os.environ.get('JWT_EXPIRE_MINUTES', '720'))
JWT_ALGO = 'HS256'

# Hash admin password once at startup (in-memory only)
ADMIN_PASSWORD_HASH = bcrypt.hashpw(ADMIN_PASSWORD.encode('utf-8'), bcrypt.gensalt())

# Public config
PIX_KEY = os.environ['PIX_KEY']
PIX_MERCHANT_NAME = os.environ['PIX_MERCHANT_NAME']
PIX_MERCHANT_CITY = os.environ['PIX_MERCHANT_CITY']
CHURCH_WHATSAPP = os.environ['CHURCH_WHATSAPP']

app = FastAPI(title="Colunas da Casa de Deus API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# ---------- Models ----------
LevelType = Literal["bronze", "prata", "ouro", "outro"]
StatusType = Literal["pendente", "aguardando_confirmacao", "confirmado"]

LEVEL_AMOUNTS = {"bronze": 50, "prata": 70, "ouro": 100}


class MemberCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    whatsapp: str
    level: LevelType
    amount: float = Field(gt=0)

    @field_validator("whatsapp")
    @classmethod
    def validate_whatsapp(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if len(digits) != 11:
            raise ValueError("WhatsApp deve conter 11 dígitos (DDD + número)")
        return digits

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v < 10:
            raise ValueError("Valor mínimo é R$ 10")
        return round(v, 2)


class Member(BaseModel):
    id: str
    name: str
    whatsapp: str
    level: LevelType
    amount: float
    status: StatusType
    created_at: str
    updated_at: str
    payment_informed_at: Optional[str] = None
    confirmed_at: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PublicConfig(BaseModel):
    pix_key: str
    merchant_name: str
    merchant_city: str
    church_whatsapp: str


class ConfirmResponse(BaseModel):
    ok: bool
    status: StatusType


# ---------- Helpers ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_token(username: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": username,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXPIRE_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def require_admin(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> str:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas ou token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials or credentials.scheme.lower() != "bearer":
        raise unauthorized
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        if payload.get("sub") != ADMIN_USERNAME:
            raise unauthorized
        return ADMIN_USERNAME
    except jwt.InvalidTokenError:
        raise unauthorized


def serialize_member(doc: dict) -> Member:
    return Member(
        id=doc["id"],
        name=doc["name"],
        whatsapp=doc["whatsapp"],
        level=doc["level"],
        amount=doc["amount"],
        status=doc["status"],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        payment_informed_at=doc.get("payment_informed_at"),
        confirmed_at=doc.get("confirmed_at"),
    )


# ---------- Public Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Colunas da Casa de Deus API"}


@api_router.get("/config", response_model=PublicConfig)
async def get_config():
    return PublicConfig(
        pix_key=PIX_KEY,
        merchant_name=PIX_MERCHANT_NAME,
        merchant_city=PIX_MERCHANT_CITY,
        church_whatsapp=CHURCH_WHATSAPP,
    )


@api_router.post("/members", response_model=Member)
async def create_member(payload: MemberCreate):
    if payload.level in LEVEL_AMOUNTS:
        payload.amount = float(LEVEL_AMOUNTS[payload.level])

    now = now_iso()
    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "whatsapp": payload.whatsapp,
        "level": payload.level,
        "amount": payload.amount,
        "status": "pendente",
        "created_at": now,
        "updated_at": now,
        "payment_informed_at": None,
        "confirmed_at": None,
    }
    await db.members.insert_one(doc.copy())
    return serialize_member(doc)


@api_router.post("/members/{member_id}/mark-paid", response_model=ConfirmResponse)
async def mark_paid(member_id: str):
    now = now_iso()
    result = await db.members.find_one_and_update(
        {"id": member_id},
        {"$set": {
            "status": "aguardando_confirmacao",
            "payment_informed_at": now,
            "updated_at": now,
        }},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Membro não encontrado")
    return ConfirmResponse(ok=True, status="aguardando_confirmacao")


# NOVO: precisa vir ANTES de "/members/{member_id}", senão o FastAPI
# tentaria interpretar "by-whatsapp" como se fosse um member_id.
@api_router.get("/members/by-whatsapp/{whatsapp}", response_model=List[Member])
async def get_members_by_whatsapp(whatsapp: str):
    digits = re.sub(r"\D", "", whatsapp)
    if len(digits) != 11:
        raise HTTPException(status_code=400, detail="WhatsApp deve conter 11 dígitos (DDD + número)")
    cursor = db.members.find({"whatsapp": digits}, {"_id": 0}).sort("created_at", -1)
    docs = await cursor.to_list(100)
    return [serialize_member(d) for d in docs]


@api_router.get("/members/{member_id}", response_model=Member)
async def get_member(member_id: str):
    doc = await db.members.find_one({"id": member_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Membro não encontrado")
    return serialize_member(doc)


# ---------- Auth ----------
@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    if data.username.strip() != ADMIN_USERNAME:
        bcrypt.checkpw(b"dummy", ADMIN_PASSWORD_HASH)
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")
    if not bcrypt.checkpw(data.password.encode("utf-8"), ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")
    return TokenResponse(access_token=create_token(ADMIN_USERNAME))


@api_router.get("/auth/me")
async def me(user: str = Depends(require_admin)):
    return {"username": user}


# ---------- Admin ----------
@api_router.get("/admin/members", response_model=List[Member])
async def list_members(
    level: Optional[LevelType] = Query(None),
    status_filter: Optional[StatusType] = Query(None, alias="status"),
    _: str = Depends(require_admin),
):
    query: dict = {}
    if level:
        query["level"] = level
    if status_filter:
        query["status"] = status_filter
    cursor = db.members.find(query, {"_id": 0}).sort("created_at", -1)
    docs = await cursor.to_list(2000)
    return [serialize_member(d) for d in docs]


@api_router.patch("/admin/members/{member_id}/confirm", response_model=Member)
async def confirm_member(member_id: str, _: str = Depends(require_admin)):
    now = now_iso()
    doc = await db.members.find_one_and_update(
        {"id": member_id},
        {"$set": {"status": "confirmado", "confirmed_at": now, "updated_at": now}},
        return_document=True,
        projection={"_id": 0},
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Membro não encontrado")
    return serialize_member(doc)


@api_router.patch("/admin/members/{member_id}/reset", response_model=Member)
async def reset_status(member_id: str, _: str = Depends(require_admin)):
    now = now_iso()
    doc = await db.members.find_one_and_update(
        {"id": member_id},
        {"$set": {"status": "pendente", "confirmed_at": None, "updated_at": now}},
        return_document=True,
        projection={"_id": 0},
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Membro não encontrado")
    return serialize_member(doc)


@api_router.delete("/admin/members/clear-all")
async def clear_all_members(_: str = Depends(require_admin)):
    res = await db.members.delete_many({})
    return {"ok": True, "deleted_count": res.deleted_count}


@api_router.delete("/admin/members/{member_id}")
async def delete_member(member_id: str, _: str = Depends(require_admin)):
    res = await db.members.delete_one({"id": member_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Membro não encontrado")
    return {"ok": True}


@api_router.get("/admin/stats")
async def stats(_: str = Depends(require_admin)):
    total = await db.members.count_documents({})
    pendente = await db.members.count_documents({"status": "pendente"})
    aguardando = await db.members.count_documents({"status": "aguardando_confirmacao"})
    confirmado = await db.members.count_documents({"status": "confirmado"})
    return {
        "total": total,
        "pendente": pendente,
        "aguardando_confirmacao": aguardando,
        "confirmado": confirmado,
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
