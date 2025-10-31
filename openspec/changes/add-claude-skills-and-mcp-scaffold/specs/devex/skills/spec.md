## ADDED Requirements

### Requirement: Project Skills Scaffolding
The project SHALL include Claude Code Project Skills under `.claude/skills/` for:
- `stripe-webhooks-simulator`
- `supabase-migrations-and-rls`
- `security-hardening`

#### Scenario: Skills visible in Claude Code
- WHEN the repository is opened in Claude Code
- THEN the above Skills are listed as Project Skills
- AND each Skill can be invoked by its description

### Requirement: Slash Commands Documentation
The project SHALL include slash command documentation under `.claude/commands/` for:
- `setup-skills` (initialize Skills scaffold)

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
