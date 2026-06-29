# JSMinify v2 — Vercel Edition

Minificador de JavaScript com auth, histórico e perfil.  
Stack: **Next.js 14 · Neon (Postgres) · Vercel**

---

## Stack de deploy

| Serviço | O que faz | Custo |
|---------|-----------|-------|
| **GitHub** | Repositório do código | Grátis |
| **Neon** | Banco de dados Postgres serverless | Grátis (0.5 GB) |
| **Vercel** | Hospedagem do Next.js | Grátis (Hobby) |

---

## Passo a passo completo

### 1. Banco de dados — Neon

1. Acesse [neon.tech](https://neon.tech) e crie conta
2. Crie um projeto (nome livre, região mais próxima)
3. No painel, vá em **SQL Editor** e cole o conteúdo de `schema.sql`
4. Clique em **Run** — as tabelas serão criadas
5. Vá em **Settings → Connection Details**
6. Copie a **Connection string** (formato `postgresql://...`)

### 2. Variáveis de ambiente locais

Edite o arquivo `.env.local` com:

```bash
DATABASE_URL=postgresql://SEU_USER:SENHA@host.neon.tech/dbname?sslmode=require
JWT_SECRET=cole-aqui-um-string-aleatorio-longo
```

Para gerar o JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Testar localmente

```bash
npm install
npm run dev
# Abra http://localhost:3000
```

### 4. Subir no GitHub

```bash
# Se ainda não tem git no projeto:
git init
git add .
git commit -m "feat: JSMinify v2 — Vercel edition"

# Crie um repositório VAZIO no github.com (sem README)
# Depois:
git remote add origin https://github.com/SEU_USER/jsminify.git
git branch -M main
git push -u origin main
```

### 5. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **Add New → Project**
3. Selecione o repositório `jsminify`
4. Em **Environment Variables**, adicione:
   - `DATABASE_URL` → a connection string do Neon
   - `JWT_SECRET` → o secret gerado
5. Clique em **Deploy**
6. Em ~1 minuto seu app estará em `https://jsminify.vercel.app` (ou similar)

> **Cada push no `main` faz deploy automático.** Zero config extra.

---

## Estrutura do projeto

```
pages/
  index.js          → redirect para /login ou /app
  login.js          → tela de login
  register.js       → tela de cadastro
  app.js            → dashboard + minificador
  profile.js        → perfil, histórico, configurações
  api/
    auth.js         → login / register / logout / me
    minify.js       → endpoint de minificação
    stats.js        → estatísticas do usuário
    profile.js      → atualizar perfil e senha

lib/
  db.js             → conexão Neon
  auth.js           → JWT, bcrypt, helpers de user/stats
  minifier.js       → lógica de minificação (portada do PHP)

styles/
  auth.css          → estilos de login/register (originais)
  app.css           → estilos do dashboard (originais)
  profile.css       → estilos do perfil (originais)

schema.sql          → SQL para criar as tabelas no Neon
```
