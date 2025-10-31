## 1. Implementation
- [ ] Create `.claude/skills/` directories and add `SKILL.md` for:
  - [ ] stripe-webhooks-simulator
  - [ ] stripe-config-and-prices
  - [ ] supabase-migrations-and-rls
  - [ ] security-hardening
  - [ ] nextjs-frontend-scaffolder
  - [ ] docs-syncer
- [ ] Create `.claude/commands/setup-skills.md` and `.claude/commands/audit-security.md` with clear steps and scope.
- [ ] Verify each Skill declares proper `allowed-tools` (read/grep/glob for auditors; write/edit for scaffolding).
- [ ] Confirm docs in `next-boilerplate-saas.txt` reflect the new commands and Skills (Available Commands + Claude Skills + MCP Integration).
- [ ] Smoke test in Claude Code: open the repo and ensure Skills are listed and auto-invoked by their descriptions.
- [ ] Optional MCP: Prepare a read-only DB MCP config (server-side secrets) and document activation steps.
- [ ] Security review: ensure secrets never appear in `NEXT_PUBLIC_*` or client code; Skills avoid unsafe actions by default.
- [ ] Documentation: add a short README section linking to `.claude/skills` and `.claude/commands` (optional if boilerplate doc already covers it).

## 2. Validation
- [ ] `openspec validate add-claude-skills-and-mcp-scaffold --strict`
- [ ] Share proposal for approval before implementing any destructive actions.

## 3. Rollback Plan
- [ ] Revert `.claude/*` additions.
- [ ] Remove references from `next-boilerplate-saas.txt` if needed.
- [ ] No schema/data changes introduced by this change.
