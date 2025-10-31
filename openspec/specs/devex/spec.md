# devex Specification

## Purpose
Define the Developer Experience (DevEx) for Claude Code integration: Project Skills for automation (Stripe, Supabase, Security, Frontend, Docs), slash commands for common workflows, and optional MCP for external system access with read-first security posture.
## Requirements
### Requirement: Project Skills Scaffolding
The project SHALL include Claude Code Project Skills under `.claude/skills/` for:
- `stripe-webhooks-simulator`
- `stripe-config-and-prices`
- `supabase-migrations-and-rls`
- `security-hardening`
- `nextjs-frontend-scaffolder`
- `docs-syncer`

#### Scenario: Skills visible in Claude Code
- WHEN the repository is opened in Claude Code
- THEN the above Skills are listed as Project Skills
- AND each Skill can be invoked by its description

### Requirement: Slash Commands Documentation
The project SHALL include slash command documentation under `.claude/commands/` for:
- `setup-skills` (initialize Skills scaffold)
- `audit-security` (run security pass for API routes and middleware)

#### Scenario: Commands discoverable
- WHEN a developer searches for available commands in the repo docs
- THEN the `.claude/commands/` directory provides actionable steps
- AND the commands match the guidance surfaced in next-boilerplate-saas.txt

### Requirement: Allowed Tools Restrictions
Each Skill SHALL declare a minimal `allowed-tools` set appropriate to its purpose:
- Audit Skills (read-first): `Read`, `Grep`, `Glob`
- Scaffolding Skills: may include `Write`, `Edit` in addition to read tools

#### Scenario: Safe-by-default Skills
- WHEN Skills are loaded
- THEN audit Skills expose only read/grep/glob tools
- AND scaffolding Skills expose write/edit only where required

### Requirement: Optional MCP Read-First Integration
When MCP is configured, the project SHALL support MCP usage with a read-first posture:
- DB MCP for `run_sql` (read-only) and `schema_introspect`
- GitHub MCP to list branches and open minimal PRs
- Vercel MCP for deploy/logs

#### Scenario: DB MCP read-only
- WHEN the DB MCP is configured
- THEN the agent can introspect schema and run read-only queries
- AND no service keys are exposed to client code; secrets are anchored server-side

### Requirement: Documentation Sync Skill
The project SHALL include a `docs-syncer` Skill that keeps payment/setup docs in sync with code changes.

#### Scenario: Docs synchronized
- WHEN prices/endpoints change in code
- THEN `docs-syncer` guides updates to PAYMENTS.md, QUICK_START.md, and IMPLEMENTATION_SUMMARY.md

