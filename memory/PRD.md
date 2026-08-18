# PRD — Colunas da Casa de Deus

## Visão Geral
App mobile/PWA para a **Igreja Visão Missionária — Sede Porto União**, complemento digital do carnê físico do projeto "Colunas da Casa de Deus". Foco: comunicação clara, botões grandes, leitura fácil para todas as idades.

## Stack
- Frontend: Expo Router 6 (React Native + Web/PWA), TypeScript
- Backend: FastAPI + MongoDB (motor)
- Auth admin: JWT (HS256) — 1 conta única lida de `.env`, hash em memória (bcrypt)
- QR Code PIX: gerado client-side (padrão EMV BR-Code + CRC16)
- Certificado: `react-native-view-shot` + `expo-sharing`

## Telas
1. **Home (`/`)** — identidade da igreja, versículo 2 Co 9:7, CTA "Quero Ser Uma Coluna", link discreto para o Painel do Pastor.
2. **Níveis (`/levels`)** — 3 cards nas cores da coluna (Bronze R$50, Prata R$70, Ouro R$100) + "Semear Outro Valor" (mín. R$10).
3. **Cadastro (`/register`)** — nome + WhatsApp com máscara `(99) 99999-9999`.
4. **Pagamento PIX (`/payment`)** — chave estática `41992246602`, botão COPIAR CHAVE PIX (área de transferência), QR Code EMV com valor, botão "Já realizei o pagamento" (marca `aguardando_confirmacao`), link WhatsApp `wa.me` com mensagem pré-formatada.
5. **Certificado (`/certificate`)** — nome do irmão, categoria (cor da coluna), bênção pastoral, botão Salvar/Compartilhar via `view-shot`.
6. **Admin Login (`/admin/login`)** — `Pr. Fabio Gomes` / `FidelidadedeDeus10` (via `.env`).
7. **Admin Dashboard (`/admin/dashboard`)** — stats (Total/Aguardando/Confirmados), filtros por nível e status, cards de membros com botão Confirmar / Redefinir, atalho WhatsApp para cada membro.

## Endpoints
- `GET /api/config` (pública)
- `POST /api/members` (pública) · `POST /api/members/{id}/mark-paid` · `GET /api/members/{id}`
- `POST /api/auth/login` · `GET /api/auth/me`
- `GET /api/admin/members?level=&status=` · `PATCH /api/admin/members/{id}/confirm` · `PATCH /api/admin/members/{id}/reset` · `GET /api/admin/stats`

## Regras de negócio
- Níveis nomeados (bronze/prata/ouro) usam valor fixo (50/70/100). "outro" aceita valor livre com mínimo R$ 10,00.
- Pagamento **não é integrado a banco**: confirmação é 100% manual pelo pastor.
- WhatsApp é apenas link `wa.me` com mensagem pré-formatada (sem API automática).

## Design
Personalidade "Glass / Luxe DARK". Fundo `#0B1120 → #111827`. Cards claros flutuando. Azul de destaque `#2563EB`. Cores metálicas exclusivas nos cards de nível e no certificado.
