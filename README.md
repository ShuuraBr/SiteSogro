# C. Carvalho — Plataforma de Governança Jurídica

Sistema completo: site institucional + portal do cliente + portal administrativo.

## Stack
- **Backend:** Node.js + Fastify + Prisma + MySQL
- **Frontend:** Next.js 14 (App Router)
- **Banco:** MySQL (Railway ou local)

## Início rápido

### 1. Backend
```bash
cd backend
cp .env.example .env
# Edite .env com suas credenciais de banco
npm install
npx prisma migrate dev
node src/config/seed.js   # cria admin + cliente demo
node server.js
```

### 2. Frontend
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

### 3. Acesse
- Site:   http://localhost:3000
- Portal: http://localhost:3000/portal  (cliente@demo.com / demo2025)
- Admin:  http://localhost:3000/admin   (admin@ccarvalho.adv.br / admin2025)

## Credenciais de demonstração
| Perfil  | E-mail                     | Senha      |
|---------|---------------------------|------------|
| Admin   | admin@ccarvalho.adv.br    | admin2025  |
| Cliente | cliente@demo.com          | demo2025   |

## Estrutura
```
backend/
  server.js              ← Fastify server
  prisma/schema.prisma   ← Schema do banco
  src/
    routes/              ← auth, portal, admin, documentos, agenda
    controllers/         ← lógica de negócio
    middleware/          ← JWT, roles
    services/            ← email, storage
    config/              ← database, seed

frontend/
  src/app/
    page.jsx             ← Site institucional
    portal/              ← Área do cliente
    admin/               ← Painel administrativo
  public/logos/          ← Logo azul + prata PNG
```
