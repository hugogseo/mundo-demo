# devex Specification Deltas

## MODIFIED Requirements

### Requirement: Project Skills Scaffolding
The project SHALL include Claude Code Project Skills under `.claude/skills/` for:
- `stripe-webhooks-simulator`
- `stripe-config-and-prices`
- `supabase-migrations-and-rls`
- `security-hardening`
- `nextjs-frontend-scaffolder`
- `docs-syncer`

AND each Skill SHALL be refactored as a sub-agent module with:
- Clear input/output contracts (JSON schema)
- Idempotent execution (safe to retry)
- Progress reporting for long-running operations
- Integration with orchestration layer

#### Scenario: Skills visible in Claude Code
- WHEN the repository is opened in Claude Code
- THEN the above Skills are listed as Project Skills
- AND each Skill can be invoked by its description
- AND Skills can be composed by the agentic orchestrator

#### Scenario: Skills as sub-agent modules
- WHEN agentic orchestrator invokes a Skill
- THEN Skill receives structured input via JSON
- AND executes with scoped context (only relevant files/data)
- AND returns structured output with status and artifacts
- AND logs all decisions for documentation generation

### Requirement: Slash Commands Documentation
The project SHALL include slash command documentation under `.claude/commands/` for:
- `setup-skills` (initialize Skills scaffold)
- `audit-security` (run security pass for API routes and middleware)
- `/build-saas` (NEW: launch agentic SaaS builder with natural language prompt)
- `/refine-saas` (NEW: iterate on existing generated SaaS)

#### Scenario: Commands discoverable
- WHEN a developer searches for available commands in the repo docs
- THEN the `.claude/commands/` directory provides actionable steps
- AND the commands match the guidance surfaced in documentation

#### Scenario: Agentic builder commands
- WHEN user types `/build-saas describe invoice management app`
- THEN system launches intent parser and sub-agent orchestrator
- AND guides user through HITL clarifications
- AND generates complete SaaS codebase

### Requirement: Allowed Tools Restrictions
Each Skill SHALL declare a minimal `allowed-tools` set appropriate to its purpose:
- Audit Skills (read-first): `Read`, `Grep`, `Glob`
- Scaffolding Skills: may include `Write`, `Edit` in addition to read tools
- Sub-Agent Skills: include tools needed for autonomous operation but restricted by scope

#### Scenario: Safe-by-default Skills
- WHEN Skills are loaded
- THEN audit Skills expose only read/grep/glob tools
- AND scaffolding Skills expose write/edit only where required
- AND sub-agent Skills have minimal tools for their domain (e.g., Schema Agent: write migrations only)

## ADDED Requirements

### Requirement: Sub-Agent Integration
The project SHALL support sub-agent invocation through Anthropic's sub-agents SDK (when available) or custom orchestration, with unified interface for skill-based and agent-based operations.

#### Scenario: Invoke sub-agent via orchestrator
- WHEN orchestrator needs specialized task (e.g., schema design)
- THEN dispatches to appropriate sub-agent with scoped context
- AND sub-agent has access to relevant Skills as tools
- AND sub-agent result is validated before integration

#### Scenario: Fallback to skill-based operation
- WHEN sub-agents SDK unavailable or sub-agent fails
- THEN system falls back to direct Skill invocation
- AND user experience remains consistent
- AND logs degradation for monitoring

### Requirement: Context Optimization
The project SHALL implement context engineering best practices to minimize token usage while maintaining quality:
- Prompt caching for boilerplate structure
- Scoped context per sub-agent (only relevant code/docs)
- Streaming for long-running operations
- Checkpointing for resumable sessions

#### Scenario: Cached boilerplate context
- WHEN agentic builder starts new session
- THEN boilerplate file structure and conventions are cached
- AND subsequent sub-agent calls reuse cached context
- AND only deltas (user intent, generated code) consume fresh tokens

#### Scenario: Scoped sub-agent context
- WHEN Schema Agent is invoked
- THEN receives only database-related files (migrations, types, RLS)
- AND does not receive frontend or API code
- AND context size stays under 50k tokens per sub-agent

### Requirement: Conversational Workflow
The project SHALL support natural language conversation as primary interface for SaaS construction, with structured commands as fallback for power users.

#### Scenario: Natural language SaaS creation
- WHEN user describes "I want a task management app with teams and permissions"
- THEN intent parser extracts entities and operations
- AND presents clarification questions in plain language
- AND generates SaaS without requiring technical knowledge

#### Scenario: Hybrid mode for developers
- WHEN user is technical and wants control
- THEN provides structured commands (`/build-saas --schema=custom --no-stripe`)
- AND allows editing generated code inline
- AND supports git-based workflow for version control

### Requirement: Progress Transparency
The system SHALL provide real-time progress updates during SaaS generation, explaining current sub-agent activity and estimated time remaining.

#### Scenario: Live progress streaming
- WHEN agentic builder is generating SaaS
- THEN streams progress updates every 5-10 seconds
- AND shows current sub-agent status (e.g., "Schema Agent: Creating RLS policies...")
- AND provides estimated completion time

#### Scenario: Cancellation and resumption
- WHEN user cancels long-running generation
- THEN checkpoints current progress
- AND allows resuming from last completed sub-agent
- AND preserves partial artifacts (migrations, components)
