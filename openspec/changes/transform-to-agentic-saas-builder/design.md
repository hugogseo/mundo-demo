# Agentic SaaS Builder - Technical Design

## Context

Current boilerplate is developer-focused: requires understanding of Next.js, Supabase, Stripe, and Claude Code ecosystem. Target users ("vibe coders") want to build SaaS without technical knowledge—they have business ideas but lack coding skills.

**Analogy**: Boilerplate = instant soup base; Claude architecture = microwave; User = decides flavor/temperature (their specific SaaS).

## Goals / Non-Goals

### Goals
1. **Zero-Effort Experience**: Non-technical users describe SaaS → get working product
2. **Natural Language Interface**: Business terminology, not technical jargon
3. **Intelligent Defaults**: System makes 90% of technical decisions automatically
4. **Sub-Agent Orchestration**: Specialized agents handle domain-specific tasks
5. **Context Efficiency**: Minimize token usage through smart context engineering
6. **HITL Refinement**: Strategic clarification questions at business level only

### Non-Goals
- Not replacing developers for complex/custom SaaS (this is for common patterns)
- Not a no-code drag-and-drop builder (it's AI-guided code generation)
- Not supporting non-JS stacks (stays within Next.js/Supabase/Stripe ecosystem)

## Architecture

### High-Level Flow

```
User Intent (NL) → Intent Parser → Sub-Agent Orchestrator → Parallel Execution → Assembly → Deployment
                        ↓                                           ↓
                  HITL Checkpoints ←────────────────────── Validation & Refinement
```

### Sub-Agents

#### 1. **Schema Agent**
- **Input**: Business entities (e.g., "invoices", "clients", "projects")
- **Output**: Supabase migrations, RLS policies, TypeScript types
- **Intelligence**: Infers relationships, suggests indexes, applies security best practices

#### 2. **API Agent**
- **Input**: Business operations (e.g., "create invoice", "send reminder")
- **Output**: Next.js API routes, Stripe integration, webhook handlers
- **Intelligence**: Maps operations to REST patterns, handles auth/validation

#### 3. **Frontend Agent**
- **Input**: User workflows (e.g., "dashboard to manage invoices")
- **Output**: React components, pages, forms with Tailwind styling
- **Intelligence**: Generates accessible, responsive UI following design system

#### 4. **Deployment Agent**
- **Input**: Completed code + env requirements
- **Output**: Configured Vercel/Supabase projects, environment variables, CI/CD
- **Intelligence**: Automates DNS, SSL, monitoring setup

### Intent Parser

**Responsibilities**:
- Extract business entities, relationships, operations
- Map to technical primitives (tables, endpoints, components)
- Identify ambiguities requiring HITL clarification

**Example**:
```
Input: "I want freelancers to create invoices and clients to pay them"
Output:
  Entities: [User(role:freelancer), Invoice, Client, Payment]
  Relationships: [User 1:N Invoice, Invoice 1:1 Payment]
  Operations: [CreateInvoice, SendInvoice, ProcessPayment]
  Questions: ["Should clients need accounts or pay as guests?"]
```

### Context Engineering

**Principles** (from Anthropic's guide):
1. **Scope Reduction**: Each sub-agent sees only relevant context
2. **Prompt Caching**: Reuse boilerplate structure across sessions
3. **Streaming**: Long-running builds stream progress, not blocking
4. **Checkpointing**: Sub-agents report progress for recovery

**Implementation**:
```
Global Context (cached):
  - Boilerplate structure
  - Tech stack conventions
  - Common patterns

Sub-Agent Context (dynamic):
  - User intent (parsed)
  - Domain-specific templates
  - Generated code from dependencies
```

### HITL Strategy

**When to Prompt**:
- ✅ Business logic clarification ("Should invoices support taxes?")
- ✅ UX preference ("Email or in-app notifications?")
- ✅ Data validation ("Max invoice amount?")
- ❌ Technical details ("Which Next.js rendering strategy?")
- ❌ Architecture decisions ("REST vs GraphQL?")

**Prompt Format**:
```
Simple Yes/No: "Should users be able to delete invoices? [Y/n]"
Multiple Choice: "Payment methods: (1) Card only (2) Card + Bank (3) All"
Open-Ended: "Describe your invoice approval workflow in 1-2 sentences"
```

## Decisions

### Decision 1: Sub-Agent Communication via Structured Messages

**What**: Sub-agents exchange JSON messages through orchestrator, not direct communication.

**Why**: 
- Enables parallel execution
- Centralizes dependency management
- Simplifies debugging and replaying

**Alternatives Considered**:
- Direct agent-to-agent calls: Too complex, creates coupling
- Shared memory: Race conditions, hard to checkpoint

**Trade-offs**:
- Pro: Clean separation, easy to add new agents
- Con: Orchestrator complexity increases

### Decision 2: Template-Based Code Generation

**What**: Sub-agents generate code by filling templates, not writing from scratch.

**Why**:
- Consistency across generated code
- Leverages boilerplate as "instant soup base"
- Easier validation and testing

**Alternatives Considered**:
- LLM generates all code: Inconsistent style, hard to validate
- Fully custom generation: Reinvents wheel, slow

**Trade-offs**:
- Pro: Fast, reliable, maintainable
- Con: Limited to template-supported patterns

### Decision 3: Anthropic Sub-Agents vs Custom Implementation

**What**: Use Anthropic's sub-agents SDK when available, custom orchestration until then.

**Why**:
- Native sub-agents will have better context management
- Seamless integration with Claude Code
- Future-proof architecture

**Alternatives Considered**:
- Build entirely custom: More control, but reinvents solved problems
- Use LangChain/Crew: Extra dependency, not optimized for Claude

**Trade-offs**:
- Pro: Best-in-class sub-agent capabilities when released
- Con: Need interim custom solution

### Decision 4: Skills as Sub-Agent Modules

**What**: Refactor existing Skills (stripe-config, supabase-migrations) into sub-agent building blocks.

**Why**:
- Reuse proven automation logic
- Gradual migration path
- Skills already designed for isolation

**Alternatives Considered**:
- Rewrite everything for sub-agents: Wasteful, risky
- Keep Skills separate: Duplication, inconsistent UX

**Trade-offs**:
- Pro: Incremental improvement, low risk
- Con: May need interface adaptations

## Risks / Trade-offs

### Risk 1: LLM Hallucination in Generated Code
**Mitigation**:
- Validate all code against TypeScript compiler before presenting
- Run automated tests on generated features
- Provide "View Generated Code" mode for user inspection

### Risk 2: Complex SaaS Patterns Not Supported
**Mitigation**:
- Start with 5-10 common SaaS patterns (CRM, invoicing, project management)
- Document limitations clearly
- Provide "hybrid mode" where developers can extend generated code

### Risk 3: Context Window Exhaustion
**Mitigation**:
- Aggressive context pruning per sub-agent
- Use prompt caching for boilerplate structure
- Implement checkpointing for long sessions

### Risk 4: HITL Fatigue (Too Many Questions)
**Mitigation**:
- Smart defaults for 90% of decisions
- Batch related questions together
- Allow "skip prompts, use defaults" mode

## Migration Plan

### Phase 1: Foundation (Weeks 1-2)
- [ ] Implement intent parser for basic entities/operations
- [ ] Create sub-agent interface and orchestrator
- [ ] Refactor 1 existing Skill (supabase-migrations) as sub-agent module
- [ ] Build template system for schema generation

### Phase 2: Core Agents (Weeks 3-4)
- [ ] Complete Schema Agent with RLS logic
- [ ] Build API Agent for REST endpoints
- [ ] Create Frontend Agent for basic CRUD UIs
- [ ] Implement HITL prompt system

### Phase 3: Polish & Integration (Weeks 5-6)
- [ ] Add Deployment Agent
- [ ] Integrate Anthropic sub-agents SDK (when available)
- [ ] Build conversational refinement loop
- [ ] Create demo flows for 3 SaaS patterns

### Phase 4: Validation & Docs (Week 7)
- [ ] User testing with non-technical users
- [ ] Performance optimization (context, latency)
- [ ] Complete documentation and examples
- [ ] Launch beta program

### Rollback Strategy
- Each phase is additive; old Skills remain functional
- Feature flag system to toggle agentic builder vs manual setup
- Can revert to current boilerplate at any point

## Implementation Notes

### Tech Stack Additions
- **Sub-Agent SDK**: Anthropic's sub-agents (when released) or custom orchestration
- **Intent Parsing**: Fine-tuned Claude prompt for entity extraction
- **Template Engine**: Handlebars or similar for code generation
- **Validation Layer**: TypeScript compiler + ESLint integration

### Performance Targets
- Intent parsing: <2s
- Single sub-agent execution: <10s
- Full SaaS generation (simple pattern): <5min
- HITL response latency: <1s

### Security Considerations
- Never expose Supabase service role key in generated client code
- Validate all user inputs before passing to sub-agents
- Sandbox generated code execution during validation
- Audit trails for all generated code and decisions

## Open Questions

1. **Pricing Model**: How to handle Stripe products for generated SaaS? Auto-create or require manual config?
2. **Customization Post-Generation**: Best UX for users to tweak generated code? In-app editor? CLI commands?
3. **Multi-Tenant Support**: Should generated SaaS default to single-tenant or multi-tenant architecture?
4. **Error Handling**: When sub-agent fails, retry automatically or prompt user for guidance?
5. **Version Control**: Integrate git commits automatically or let user manage?

## Success Metrics

- **User Success Rate**: 80%+ of users complete SaaS generation without abandoning
- **Technical Accuracy**: 95%+ of generated code passes validation tests
- **Time to First SaaS**: Median <10 minutes from start to deployed preview
- **HITL Efficiency**: Average <5 clarification questions per SaaS
- **User Satisfaction**: NPS >50 from non-technical users
