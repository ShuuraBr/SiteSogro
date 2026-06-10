# C. Carvalho — Iniciar o Projeto

## Pré-requisitos
- Node.js 18+ instalado
- MySQL rodando (local ou Railway)

## Passo a passo

### 1. Backend

```bash
cd ccarvalho/backend
```

Copie e configure o `.env`:
```bash
copy .env.example .env
# Abra .env e edite DATABASE_URL com suas credenciais MySQL
```

Instale e inicialize:
```bash
npm install
npx prisma migrate dev --name init
node src/config/seed.js
node server.js
```
✅ Backend rodando em http://localhost:3001

---

### 2. Frontend (novo terminal)

```bash
cd ccarvalho/frontend
copy .env.local.example .env.local
npm install
npm run dev
```
✅ Frontend rodando em http://localhost:3000

---

## URLs de acesso

| URL | Descrição |
|-----|-----------|
| http://localhost:3000 | Site institucional |
| http://localhost:3000/portal | Portal do cliente |
| http://localhost:3000/admin | Painel administrativo |

## Credenciais de teste

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Admin | admin@ccarvalho.adv.br | admin2025 |
| Cliente | cliente@demo.com | demo2025 |

## DATABASE_URL para Railway (exemplo)
```
DATABASE_URL="mysql://root:senha@kodama.proxy.rlwy.net:12345/railway"
```

## DATABASE_URL para MySQL local
```
DATABASE_URL="mysql://root:suasenha@localhost:3306/ccarvalho"
```
Para criar o banco local:
```sql
mysql -u root -p -e "CREATE DATABASE ccarvalho CHARACTER SET utf8mb4;"
```
