## 1. Implementation
- [ ] Create `.claude/skills/` directories and add `SKILL.md` for:
  - [ ] stripe-webhooks-simulator
  - [ ] supabase-migrations-and-rls
  - [ ] security-hardening
- [ ] Create `.claude/commands/setup-skills.md` with clear steps and scope.
- [ ] Verify each Skill declares proper `allowed-tools` (read/grep/glob for auditors; write/edit for scaffolding).
- [ ] Confirm docs in `next-boilerplate-saas.txt` mention `/setup-skills` and list the three Skills.
- [ ] Smoke test in Claude Code: open the repo and ensure Skills are listed and auto-invoked by their descriptions.
- [ ] (MVP) Skip MCP configuration in this change; plan as separate change if needed.
- [ ] Security review: ensure secrets never appear in `NEXT_PUBLIC_*` or client code; Skills avoid unsafe actions by default.
- [ ] Documentation: add a short README section linking to `.claude/skills` and `.claude/commands` (optional if boilerplate doc already covers it).

## 2. Validation
- [ ] `openspec validate add-claude-skills-and-mcp-scaffold --strict`
- [ ] Share proposal for approval before implementing any destructive actions.

## 3. Rollback Plan
- [ ] Revert `.claude/*` additions.
- [ ] Remove references from `next-boilerplate-saas.txt` if needed.
- [ ] No schema/data changes introduced by this change.
