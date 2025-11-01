# Implementation Tasks

## 1. Foundation & Infrastructure
- [ ] 1.1 Research and prototype Anthropic sub-agents SDK integration
- [ ] 1.2 Design sub-agent communication protocol (JSON schema for messages)
- [x] 1.3 Create orchestrator core (`lib/agentic/orchestrator.ts`)
- [x] 1.4 Implement intent parser module (`lib/agentic/intent-parser.ts`)
- [x] 1.5 Add context management utilities (caching, scoping, checkpointing)
- [x] 1.6 Create template engine for code generation (`lib/agentic/templates/`)
- [x] 1.7 Update `package.json` with new dependencies (sub-agents SDK, template engine)

## 2. Sub-Agent Modules
- [ ] 2.1 Refactor `supabase-migrations-and-rls` Skill as Schema Agent module
- [x] 2.2 Create Schema Agent interface with input/output contracts
- [x] 2.3 Implement entity-to-schema mapping logic
- [x] 2.4 Add RLS policy generation based on inferred permissions
- [x] 2.5 Create API Agent module (`lib/agentic/agents/api-agent.ts`)
- [x] 2.6 Implement operation-to-endpoint mapping logic
- [x] 2.7 Add Stripe integration generation for payment operations
- [x] 2.8 Create Frontend Agent module (`lib/agentic/agents/frontend-agent.ts`)
- [ ] 2.9 Implement workflow-to-UI mapping logic
- [x] 2.10 Add component templates for common patterns (tables, forms, dashboards)
- [x] 2.11 Create Deployment Agent module (`lib/agentic/agents/deployment-agent.ts`)
- [ ] 2.12 Implement Vercel auto-deployment integration
- [ ] 2.13 Add Supabase project initialization logic

## 3. Intent Parsing & HITL
- [ ] 3.1 Create entity extraction prompt templates
- [ ] 3.2 Implement relationship inference algorithm
- [ ] 3.3 Add ambiguity detection logic
- [x] 3.4 Create HITL question generator (`lib/agentic/hitl.ts`)
- [ ] 3.5 Implement question batching and prioritization
- [x] 3.6 Add default selection heuristics
- [ ] 3.7 Create conversational refinement loop handler

## 4. Code Generation & Templates
- [x] 4.1 Create migration template with dynamic columns/constraints
- [x] 4.2 Create API route templates (CRUD, auth, validation)
- [x] 4.3 Create React component templates (forms, tables, modals)
- [x] 4.4 Create page templates (dashboard, list, detail)
- [x] 4.5 Add TypeScript type generation from schema
- [ ] 4.6 Implement template composition engine (merge multiple templates)
- [x] 4.7 Add code formatting (Prettier integration)

## 5. Validation & Testing
- [ ] 5.1 Create TypeScript compilation validator
- [ ] 5.2 Implement automated test generator for API endpoints
- [ ] 5.3 Add ESLint validation for generated code
- [ ] 5.4 Create sub-agent output validator (schema compliance)
- [ ] 5.5 Implement integration test runner
- [ ] 5.6 Add smoke test for generated SaaS (can it boot?)

## 6. Commands & UI
- [x] 6.1 Create `/build-saas` command handler (`.claude/commands/build-saas.md`)
- [ ] 6.2 Implement natural language prompt parsing
- [ ] 6.3 Add streaming progress UI (console output)
- [x] 6.4 Create `/refine-saas` command handler (`.claude/commands/refine-saas.md`)
- [ ] 6.5 Implement delta generation for refinements
- [x] 6.6 Add preview mode (show generated code before finalizing)
- [ ] 6.7 Create cancellation and resumption flow

## 7. Context Engineering
- [ ] 7.1 Implement prompt caching for boilerplate structure
- [ ] 7.2 Create context scoping per sub-agent (filter relevant files)
- [ ] 7.3 Add streaming response handler for long operations
- [ ] 7.4 Implement checkpoint serialization/deserialization
- [ ] 7.5 Create context size monitoring and alerts
- [ ] 7.6 Optimize prompts using Anthropic's context engineering guidelines

## 8. Documentation & Examples
- [ ] 8.1 Generate architecture docs automatically (`ARCHITECTURE.md`)
- [ ] 8.2 Create entity-relationship diagram generator
- [ ] 8.3 Generate API flow diagrams
- [ ] 8.4 Create user guide generator (`USER_GUIDE.md`)
- [ ] 8.5 Add screenshot capture for workflows (optional, future)
- [ ] 8.6 Create 3 demo SaaS patterns (Invoice, CRM, Task Management)
- [ ] 8.7 Document each demo with step-by-step walkthrough

## 9. Integration & Polish
- [ ] 9.1 Integrate all sub-agents with orchestrator
- [ ] 9.2 Add error handling and retry logic
- [ ] 9.3 Implement fallback to manual Skill invocation
- [ ] 9.4 Create monitoring and logging infrastructure
- [ ] 9.5 Add performance metrics collection (latency, token usage)
- [ ] 9.6 Implement feature flags for gradual rollout
- [ ] 9.7 Add rollback mechanism to previous boilerplate behavior

## 10. Testing & Validation
- [ ] 10.1 User test with 5 non-technical users (record sessions)
- [ ] 10.2 Collect feedback on HITL questions (too many? too technical?)
- [ ] 10.3 Validate generated SaaS against requirements
- [ ] 10.4 Performance benchmark (time to first SaaS, token usage)
- [ ] 10.5 Security audit of generated code
- [ ] 10.6 Fix critical bugs from user testing
- [ ] 10.7 Update documentation based on feedback

## 11. Launch Preparation
- [ ] 11.1 Create landing page explaining agentic builder
- [ ] 11.2 Record demo video (3-5 minutes)
- [ ] 11.3 Write launch announcement blog post
- [ ] 11.4 Prepare FAQ based on user questions
- [ ] 11.5 Set up support channel (Discord/GitHub Discussions)
- [ ] 11.6 Create beta program sign-up
- [ ] 11.7 Final QA pass on all 3 demo patterns

## Dependencies
- Phase 1 (tasks 1-3): Foundation must complete before sub-agents
- Phase 2 (tasks 4-7): Sub-agents can be built in parallel after foundation
- Phase 3 (tasks 8-9): Integration requires all sub-agents completed
- Phase 4 (tasks 10-11): Testing and launch after integration

## Validation Criteria
Each task completion must include:
- Code review (if code changes)
- Unit tests (if new logic)
- Manual verification (run command/feature works as expected)
- Documentation update (if user-facing change)
