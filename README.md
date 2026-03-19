# AnimeList

Catálogo pessoal de animes e mangás com perfil customizável, avaliações, listas e mais.

## Stack

- **Next.js 15** + React 19 + TypeScript
- **Tailwind CSS 4**
- **Prisma** + PostgreSQL (Supabase)
- **Supabase Storage** (uploads)
- **NextAuth.js** (autenticação)
- **Lucide React** (ícones)
- **Jikan API** (dados de anime/mangá)

## Setup Local

```bash
# Instalar dependências
npm install

# Copiar .env de exemplo e preencher
cp .env.example .env

# Criar tabelas no banco
npx prisma db push

# Rodar em dev
npm run dev
```

## Deploy em Produção (Vercel + Supabase)

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **Settings > Database** e copie:
   - `Connection string (URI)` → `DATABASE_URL` (use a porta **6543** com `?pgbouncer=true`)
   - `Connection string (URI)` → `DIRECT_URL` (use a porta **5432** sem pgbouncer)
3. Vá em **Settings > API** e copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role key` → `SUPABASE_SERVICE_KEY`
4. Vá em **Storage** e crie um bucket chamado `uploads` com **política pública de leitura**:
   - Clique em "New bucket" → nome: `uploads` → marque "Public bucket"

### 2. Vercel

1. Conecte o repositório GitHub na [Vercel](https://vercel.com)
2. Em **Environment Variables**, adicione todas as vars do `.env.example`
3. Deploy automático ao dar push

### 3. Banco de dados

Após configurar as env vars, rode uma vez:

```bash
npx prisma db push
```

Ou na Vercel, adicione no Build Command:

```
npx prisma generate && npx prisma db push && next build
```

### 4. Opcionais

- **Discord OAuth**: Crie app em [discord.com/developers](https://discord.com/developers/applications) → OAuth2 → Redirect: `https://SEU_DOMINIO/api/user/discord/callback`
- **Resend (email)**: Crie chave em [resend.com](https://resend.com) → Se tiver domínio próprio, configure DNS para enviar com seu email

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `NEXTAUTH_SECRET` | ✅ | Chave secreta para JWT |
| `NEXTAUTH_URL` | ✅ | URL do site (ex: https://animelist.vercel.app) |
| `DATABASE_URL` | ✅ | PostgreSQL connection string (pooler) |
| `DIRECT_URL` | ✅ | PostgreSQL connection string (direct) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL do projeto Supabase |
| `SUPABASE_SERVICE_KEY` | ✅ | Service role key do Supabase |
| `DISCORD_CLIENT_ID` | ❌ | Discord OAuth client ID |
| `DISCORD_CLIENT_SECRET` | ❌ | Discord OAuth client secret |
| `RESEND_API_KEY` | ❌ | API key do Resend para emails |
| `RESEND_FROM_EMAIL` | ❌ | Email remetente |
