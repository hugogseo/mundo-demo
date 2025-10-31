# Next.js SaaS Boilerplate with Claude Code

A production-ready SaaS boilerplate with Next.js, Supabase authentication, and Stripe subscription payments.

## 🚀 Status

✅ **Project Structure Created**
- Next.js 16 configuration
- TypeScript setup
- Tailwind CSS configured
- Supabase clients (browser, server, middleware)
- Type definitions (database schema)
- Claude Code Skills (6 Skills + 2 Commands)
- OpenSpec workflow integrated

## 📦 Installation

```bash
# Install dependencies
npm install

# Start Supabase local instance
npm run supabase:start

# Copy environment variables
cp .env.example .env

# Follow setup instructions in .env file
```

## 🤖 Claude Code Integration

This boilerplate includes Claude Code Project Skills:

- **stripe-webhooks-simulator** - Test webhook flows
- **stripe-config-and-prices** - Manage products/prices
- **supabase-migrations-and-rls** - Database migrations
- **security-hardening** - Security audits
- **nextjs-frontend-scaffolder** - UI scaffolding
- **docs-syncer** - Keep docs in sync

### Available Commands

- `/setup-skills` - Initialize Skills scaffold
- `/audit-security` - Run security pass

## 🏗️ Next Steps

### 1. Complete Boilerplate Implementation

Run the following to generate remaining files:

```bash
# The boilerplate has base structure but needs:
# - Complete app/* pages (auth/login, dashboard, pricing)
# - API routes (stripe checkout, webhooks)
# - Supabase migrations
# - Setup scripts
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Start Supabase
npm run supabase:start

# Get credentials
supabase status

# Update .env with actual values
```

### 4. Run Development Server

```bash
npm run dev
```

## 📁 Current Structure

```
/
├── .claude/              # Claude Code Skills & Commands
├── openspec/             # OpenSpec specs & changes
├── app/                  # Next.js App Router
│   ├── layout.tsx       ✅
│   ├── page.tsx         ✅
│   └── globals.css      ✅
├── lib/                  # Utilities
│   └── supabase/        ✅ (client, server, middleware)
├── types/                ✅
│   └── database.ts      # TypeScript types
├── middleware.ts         ✅
├── package.json          ✅
├── tsconfig.json         ✅
├── tailwind.config.ts    ✅
└── .env.example          ✅
```

## 🔧 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## 📖 Documentation

- See `plan.md` for implementation details
- See `next-boilerplate-saas.txt` for complete file contents
- See `openspec/` for spec-driven development workflow

## 🎯 Features (Planned)

- [ ] Magic link authentication
- [ ] Protected dashboard
- [ ] Stripe subscriptions (Pro, Enterprise)
- [ ] Webhook handling
- [ ] RLS policies
- [ ] Server-side rendering
- [ ] Type-safe API

## 🔐 Security

All Skills use minimal `allowed-tools`:
- Audit Skills: Read, Grep, Glob only
- Scaffolding Skills: Write, Edit where needed
- No secrets in `NEXT_PUBLIC_*` variables

---

**Need help?** Check `.claude/skills/` for available automations or run `/audit-security` for security review.
