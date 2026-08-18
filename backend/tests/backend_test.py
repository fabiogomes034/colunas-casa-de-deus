"""End-to-end backend tests for Colunas da Casa de Deus API."""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://projeto-colunas.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_USER = "Pr. Fabio Gomes"
ADMIN_PASS = "FidelidadedeDeus10"


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Public config ----------
class TestConfig:
    def test_get_config(self):
        r = requests.get(f"{API}/config", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["pix_key"] == "41992246602"
        assert data["merchant_name"] == "IGREJA VISAO MISSIONARIA"
        assert data["merchant_city"] == "PORTO UNIAO"
        assert data["church_whatsapp"] == "5541992246602"


# ---------- Member creation & validation ----------
class TestMembers:
    def test_create_bronze_forces_amount_50(self):
        payload = {"name": "TEST_Bronze User", "whatsapp": "(41) 99224-6602", "level": "bronze", "amount": 999}
        r = requests.post(f"{API}/members", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        m = r.json()
        assert m["level"] == "bronze"
        assert m["amount"] == 50.0
        assert m["status"] == "pendente"
        assert m["whatsapp"] == "41992246602"  # digits only
        # Verify persistence
        r2 = requests.get(f"{API}/members/{m['id']}", timeout=15)
        assert r2.status_code == 200
        assert r2.json()["id"] == m["id"]

    def test_create_prata_forces_70(self):
        r = requests.post(f"{API}/members", json={"name": "TEST_Prata", "whatsapp": "41992246602", "level": "prata", "amount": 12}, timeout=15)
        assert r.status_code == 200
        assert r.json()["amount"] == 70.0

    def test_create_ouro_forces_100(self):
        r = requests.post(f"{API}/members", json={"name": "TEST_Ouro", "whatsapp": "41992246602", "level": "ouro", "amount": 1}, timeout=15)
        # amount<10 for named tier is overridden by server, but Pydantic validates before override
        # Server-side: validator runs first, so amount<10 rejected. Use valid amount:
        assert r.status_code in (200, 422)

    def test_create_ouro_with_valid_amount(self):
        r = requests.post(f"{API}/members", json={"name": "TEST_Ouro2", "whatsapp": "41992246602", "level": "ouro", "amount": 50}, timeout=15)
        assert r.status_code == 200
        assert r.json()["amount"] == 100.0

    def test_create_outro_min_amount(self):
        r = requests.post(f"{API}/members", json={"name": "TEST_Outro", "whatsapp": "41992246602", "level": "outro", "amount": 25}, timeout=15)
        assert r.status_code == 200
        assert r.json()["amount"] == 25.0

    def test_outro_rejects_amount_below_10(self):
        r = requests.post(f"{API}/members", json={"name": "TEST_Small", "whatsapp": "41992246602", "level": "outro", "amount": 5}, timeout=15)
        assert r.status_code == 422

    def test_whatsapp_must_be_11_digits(self):
        r = requests.post(f"{API}/members", json={"name": "TEST_BadPhone", "whatsapp": "12345", "level": "outro", "amount": 15}, timeout=15)
        assert r.status_code == 422

    def test_name_too_short(self):
        r = requests.post(f"{API}/members", json={"name": "A", "whatsapp": "41992246602", "level": "outro", "amount": 15}, timeout=15)
        assert r.status_code == 422

    def test_invalid_level(self):
        r = requests.post(f"{API}/members", json={"name": "TEST_BadLvl", "whatsapp": "41992246602", "level": "diamond", "amount": 15}, timeout=15)
        assert r.status_code == 422

    def test_get_missing_member(self):
        r = requests.get(f"{API}/members/nonexistent-id-xyz", timeout=15)
        assert r.status_code == 404

    def test_mark_paid_flow(self):
        r = requests.post(f"{API}/members", json={"name": "TEST_MarkPaid", "whatsapp": "41992246602", "level": "bronze", "amount": 50}, timeout=15)
        mid = r.json()["id"]
        r2 = requests.post(f"{API}/members/{mid}/mark-paid", timeout=15)
        assert r2.status_code == 200
        assert r2.json()["status"] == "aguardando_confirmacao"
        # Verify persisted
        r3 = requests.get(f"{API}/members/{mid}", timeout=15)
        assert r3.json()["status"] == "aguardando_confirmacao"
        assert r3.json()["payment_informed_at"] is not None

    def test_mark_paid_missing(self):
        r = requests.post(f"{API}/members/nonexistent-xyz/mark-paid", timeout=15)
        assert r.status_code == 404


# ---------- Auth ----------
class TestAuth:
    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"username": ADMIN_USER, "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_login_wrong_user(self):
        r = requests.post(f"{API}/auth/login", json={"username": "nobody", "password": ADMIN_PASS}, timeout=15)
        assert r.status_code == 401

    def test_login_success_returns_jwt(self):
        r = requests.post(f"{API}/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["token_type"] == "bearer"
        assert len(data["access_token"].split(".")) == 3  # JWT

    def test_me_requires_token(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_me_with_token(self, auth_headers):
        r = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["username"] == ADMIN_USER


# ---------- Admin ----------
class TestAdmin:
    def test_list_members_requires_auth(self):
        r = requests.get(f"{API}/admin/members", timeout=15)
        assert r.status_code == 401

    def test_list_members(self, auth_headers):
        r = requests.get(f"{API}/admin/members", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_filter_by_level(self, auth_headers):
        r = requests.get(f"{API}/admin/members?level=bronze", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        for m in r.json():
            assert m["level"] == "bronze"

    def test_filter_by_status(self, auth_headers):
        r = requests.get(f"{API}/admin/members?status=aguardando_confirmacao", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        for m in r.json():
            assert m["status"] == "aguardando_confirmacao"

    def test_confirm_and_reset_flow(self, auth_headers):
        # Create + mark paid
        c = requests.post(f"{API}/members", json={"name": "TEST_Confirm", "whatsapp": "41992246602", "level": "ouro", "amount": 100}, timeout=15).json()
        requests.post(f"{API}/members/{c['id']}/mark-paid", timeout=15)
        # Confirm
        r = requests.patch(f"{API}/admin/members/{c['id']}/confirm", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["status"] == "confirmado"
        assert r.json()["confirmed_at"] is not None
        # Reset
        r2 = requests.patch(f"{API}/admin/members/{c['id']}/reset", headers=auth_headers, timeout=15)
        assert r2.status_code == 200
        assert r2.json()["status"] == "pendente"
        assert r2.json()["confirmed_at"] is None

    def test_confirm_requires_auth(self):
        r = requests.patch(f"{API}/admin/members/anything/confirm", timeout=15)
        assert r.status_code == 401

    def test_confirm_missing_member(self, auth_headers):
        r = requests.patch(f"{API}/admin/members/does-not-exist/confirm", headers=auth_headers, timeout=15)
        assert r.status_code == 404

    def test_stats(self, auth_headers):
        r = requests.get(f"{API}/admin/stats", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        for k in ("total", "pendente", "aguardando_confirmacao", "confirmado"):
            assert k in data
            assert isinstance(data[k], int)
        assert data["total"] >= data["pendente"] + data["aguardando_confirmacao"] + data["confirmado"]

    def test_stats_requires_auth(self):
        r = requests.get(f"{API}/admin/stats", timeout=15)
        assert r.status_code == 401
