## Why
Accelerate "AI SaaS without effort" by adding first-class Claude Code Project Skills and slash commands to this Next.js boilerplate, aligned with the implementation plan in plan.md and the command scaffolding in next-boilerplate-saas.txt. This enables predictable, model-invoked automation for setup, Stripe flows, migrations, security checks, and docs sync, reducing manual steps.

## What Changes
- Add Project Skills scaffold under `.claude/skills/` with three MVP Skills:
  - `stripe-webhooks-simulator`, `supabase-migrations-and-rls`, `security-hardening`.
- Add slash command docs under `.claude/commands/`:
  - `setup-skills.md` (initialize Skills).
- Restrict tool access per Skill using `allowed-tools` (read-first for audits; write/edit only where strictly required).
- Update docs mínimamente para mencionar `/setup-skills` y las tres Skills.

## Impact
- Affected specs: `devex/skills`.
- Affected code/docs:
  - `.claude/skills/*/SKILL.md`
  - `.claude/commands/setup-skills.md`
  - `next-boilerplate-saas.txt` (mención mínima de `/setup-skills` y lista de Skills)
  - `plan.md` (scaffolding preliminar)
