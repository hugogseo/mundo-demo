## Why
Accelerate "AI SaaS without effort" by adding first-class Claude Code Project Skills and slash commands to this Next.js boilerplate, aligned with the implementation plan in plan.md and the command scaffolding in next-boilerplate-saas.txt. This enables predictable, model-invoked automation for setup, Stripe flows, migrations, security checks, and docs sync, reducing manual steps.

## What Changes
- Add Project Skills scaffold under `.claude/skills/` with six focused Skills:
  - `stripe-webhooks-simulator`, `stripe-config-and-prices`, `supabase-migrations-and-rls`, `security-hardening`, `nextjs-frontend-scaffolder`, `docs-syncer`.
- Add slash command docs under `.claude/commands/`:
  - `setup-skills.md` (initialize Skills), `audit-security.md` (security pass).
- Restrict tool access per Skill using `allowed-tools` (read-first for audits; write/edit for scaffolding where required).
- Document optional MCP usage (DB read-only, GitHub PRs, Vercel deploy/logs) with a "read-first" security posture.
- Ensure docs: extend "Available Commands" and add "Claude Skills" + "MCP Integration" sections (see next-boilerplate-saas.txt updates).

## Impact
- Affected specs: `devex/skills`.
- Affected code/docs:
  - `.claude/skills/*/SKILL.md`
  - `.claude/commands/{setup-skills,audit-security}.md`
  - `next-boilerplate-saas.txt` (commands + sections)
  - `plan.md` (scaffolding preliminar)
