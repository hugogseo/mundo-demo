# Implementation Tasks

## 1. Foundation & Infrastructure
- [x] 1.1 Create orchestrator core (`lib/agentic/orchestrator.ts`)
- [x] 1.2 Implement intent parser module (`lib/agentic/intent-parser.ts`)
- [x] 1.3 Add context management utilities (caching, scoping)
- [x] 1.4 Create template engine for code generation (`lib/agentic/templates/`)
- [x] 1.5 Update `package.json` with TypeScript, tsx, and testing dependencies

## 2. Sub-Agent Modules
- [x] 2.1 Create Schema Agent for Claude Code (`.claude/agents/schema-agent.md`)
- [x] 2.2 Implement entity-to-schema mapping logic in templates
- [x] 2.3 Add RLS policy generation based on inferred permissions
- [x] 2.4 Create API Agent for Claude Code (`.claude/agents/api-agent.md`)
- [x] 2.5 Implement operation-to-endpoint mapping logic
- [x] 2.6 Add Stripe integration generation for payment operations
- [x] 2.7 Create Frontend Agent for Claude Code (`.claude/agents/frontend-agent.md`)
- [x] 2.8 Add component templates for common patterns (tables, forms, dashboards)
- [x] 2.9 Create Deployment Agent for Claude Code (`.claude/agents/deployment-agent.md`)
- [x] 2.10 Implement Vercel auto-deployment script (`scripts/deploy-vercel.ts`)
- [x] 2.11 Add Supabase project initialization script (`scripts/init-supabase.ts`)
- [x] 2.12 Integrate sub-agents with slash commands (orchestration)
- [x] 2.13 Consolidate legacy skills into sub-agents (zero overlap)

## 3. Intent Parsing & HITL
- [x] 3.1 Improve entity extraction in intent parser (expand keyword coverage)
- [x] 3.2 Enhance relationship inference algorithm (more patterns)
- [x] 3.3 Create HITL question generator (`lib/agentic/hitl.ts`)
- [x] 3.4 Add default selection heuristics

## 4. Code Generation & Templates
- [x] 4.1 Create migration template with dynamic columns/constraints
- [x] 4.2 Create API route templates (CRUD, auth, validation)
- [x] 4.3 Create React component templates (forms, tables, modals)
- [x] 4.4 Create page templates (dashboard, list, detail)
- [x] 4.5 Add TypeScript type generation from schema
- [x] 4.6 Add code formatting (Prettier integration)

## 5. Validation & Testing
- [x] 5.1 Create TypeScript compilation validator (`scripts/validate-agentic.ts`)
- [x] 5.2 Add unit tests for intent parser
- [ ] 5.3 Add unit tests for sub-agents (basic coverage)

## 6. Claude Code Integration
- [x] 6.1 Create slash commands in `.claude/commands/`
  - [x] `/build-saas` - Generate SaaS from description
  - [x] `/refine-saas` - Iterative refinement
  - [x] `/setup-supabase` - Database setup workflow
  - [x] `/setup-stripe` - Payment integration workflow
  - [x] `/deploy-full` - Full deployment pipeline
  - [x] `/audit-security` - Security scan
- [x] 6.2 Configure MCP servers (`.claude.json`)
  - [x] Supabase MCP for database operations
  - [x] Stripe MCP for payment configuration
- [x] 6.3 Document memory system usage (`CLAUDE.md`)
- [x] 6.4 Create CLI scripts for orchestration
  - [x] `npm run agentic:orchestrate`
  - [x] `npm run agentic:refine`
  - [x] `npm run agentic:validate`
  - [x] `npm run agentic:init-supabase`
  - [x] `npm run agentic:deploy`

## 7. Documentation
- [x] 7.1 Project documentation
  - [x] `CLAUDE.md` - Claude Code integration guide
  - [x] `DEPLOY.md` - Deployment automation
  - [x] `SUPABASE.md` - Supabase initialization
  - [x] `ARCHITECTURE.md` - Tech stack overview
  - [x] `README.md` - Quick start guide
- [x] 7.2 Agent documentation
  - [x] Template usage examples in comments
  - [x] Type definitions with JSDoc
- [x] 7.3 Command documentation
  - [x] YAML frontmatter in slash commands
  - [x] Step-by-step workflows
  - [x] Troubleshooting sections

## 8. Polish & Refinement
- [ ] 8.1 Improve intent parser entity coverage (more keywords)
- [ ] 8.2 Add error handling in orchestrator (retry logic)
- [ ] 8.3 Enhance HITL questions (more contextual)
- [ ] 8.4 Optimize generated code templates (reduce boilerplate)

## MVP Complete Criteria
The system is production-ready when:
- ✅ All sub-agents generate valid TypeScript/SQL code
- ✅ `npm run agentic:orchestrate` produces deployable SaaS
- ✅ Slash commands work in Claude Code without errors
- ✅ MCP servers integrate correctly (Supabase, Stripe)
- ✅ Automated deployment scripts complete successfully
- ✅ TypeScript validation passes (`npm run agentic:validate`)
- ✅ Core documentation exists and is accurate

## Post-MVP (Future Enhancements)
- Improve entity extraction with more sophisticated NLP
- Add support for more integrations (Resend, Auth0, etc.)
- Generate automated tests for API routes
- Add telemetry for usage patterns
- Create demo videos and tutorials
