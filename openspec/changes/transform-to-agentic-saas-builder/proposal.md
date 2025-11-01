# Transform to Agentic SaaS Builder

## Why

The current boilerplate requires developers to understand Next.js, Supabase, Stripe, and Claude Code architecture. **Market promise**: "Zero-effort SaaS for vibe coders" means non-technical users should describe their SaaS idea in natural language and get a fully functional application without touching code. The boilerplate should be "instant soup" (ready-to-use foundation) while Claude Code becomes the "microwave" (intelligent orchestration) that transforms user intent into deployed SaaS.

## What Changes

### Core Transformation
- **Sub-Agents Architecture**: Implement specialized sub-agents for domain-specific tasks (database schema design, API endpoint generation, UI scaffolding, deployment)
- **Natural Language Interface**: HITL (Human-in-the-Loop) conversational flow where users describe SaaS features in plain language
- **Context Engineering**: Hyper-simplified context management using Commands, Skills, MCPs, and sub-agents to eliminate cognitive overhead
- **Zero-Config Experience**: Automated decision-making with smart defaults; users only specify business requirements ("I want a task management app with teams")

### New Capabilities
- **Agentic Builder System**: Orchestration layer that interprets user intent, delegates to sub-agents, and assembles the final SaaS
- **Intent Parser**: Natural language → structured requirements → executable tasks
- **Sub-Agent Coordination**: Database Agent, API Agent, Frontend Agent, Deployment Agent working in parallel
- **Interactive Refinement**: Conversational loops to clarify ambiguities without requiring technical knowledge

### Modified Capabilities
- **DevEx Enhancement**: Existing Skills and Commands become sub-agent building blocks
- **Documentation**: Self-documenting system that explains decisions to users in their language
- **Setup Automation**: From multi-step manual setup to single-command orchestrated launch

## Impact

### Affected Specs
- **devex** (MODIFIED) - Enhanced with sub-agent integration, context optimization
- **agentic-builder** (NEW) - Core capability for AI-driven SaaS construction

### Affected Code
- `.claude/skills/` - Refactored as sub-agent modules with clear interfaces
- `.claude/commands/` - New orchestration commands for natural language workflows
- `scripts/` - Intelligent setup scripts with decision-making
- `app/` - Template system for dynamic feature generation
- `lib/` - Abstracted services for sub-agent consumption

### Architecture Shift
**BEFORE**: Developer configures boilerplate → Manually customizes → Deploys  
**AFTER**: User describes SaaS → Agentic system generates → Auto-deploys

### User Journey
```
User: "I want to build a SaaS for freelancers to manage invoices"
↓
Intent Parser: Identifies entities (users, invoices, clients)
↓
Sub-Agents: Design schema → Generate APIs → Scaffold UI → Configure payments
↓
HITL Checkpoints: "Should invoices have recurring billing? [Y/n]"
↓
Output: Fully functional invoice management SaaS ready to customize
```

## Dependencies
- Anthropic Sub-Agents API/SDK integration
- Enhanced MCP configuration for external system orchestration
- Streaming context management for long-running build sessions

## Success Criteria
1. Non-technical user can describe SaaS idea and get working prototype in <10 minutes
2. Sub-agents handle 90%+ of technical decisions automatically
3. HITL prompts are business-focused, never code-focused
4. System generates documentation explaining all architectural choices
5. Zero manual configuration for common SaaS patterns
