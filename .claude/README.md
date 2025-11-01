# Claude Code Integration

This directory contains Claude Code-specific configuration, commands, and skills.

## Structure

```
.claude/
├── agents/            # Specialized sub-agents for focused tasks
│   ├── schema-agent.md
│   ├── api-agent.md
│   ├── frontend-agent.md
│   └── deployment-agent.md
├── commands/          # Slash commands for guided workflows
│   ├── setup-supabase.md
│   ├── setup-stripe.md
│   ├── deploy-full.md
│   ├── build-saas.md
│   ├── refine-saas.md
│   ├── audit-security.md
│   └── openspec/      # OpenSpec workflow commands
├── skills/            # Deprecated (knowledge migrated to agents)
└── README.md          # This file
```

## Slash Commands

Slash commands are markdown files with YAML frontmatter that provide step-by-step workflows.

### Format

```markdown
---
description: Short description of what the command does
allowed-tools: Read, Edit, Write, MCPTool, RunCommand
---

# Command Title

Detailed instructions...
```

### Available Commands

- **`/setup-supabase`** - Configure Supabase project with migrations and RLS
- **`/setup-stripe`** - Configure Stripe payments and webhooks
- **`/deploy-full`** - Full production deployment workflow
- **`/build-saas`** - Generate SaaS from natural language description
- **`/refine-saas`** - Iteratively refine generated code
- **`/audit-security`** - Security audit for API routes

### Creating New Commands

1. Create a markdown file in `.claude/commands/`
2. Add YAML frontmatter with `description` and `allowed-tools`
3. Write step-by-step instructions
4. Restart Claude Code to load the command

## Sub-Agents

Sub-agents are specialized AI agents with focused expertise. Commands orchestrate sub-agents to accomplish complex workflows.

### Available Sub-Agents

- **Schema Agent** (`schema-agent.md`)
  - **Focus:** Database schema, migrations, RLS policies
  - **Scope:** `supabase/migrations/`, `types/database.ts`
  - **Expertise:** PostgreSQL, Supabase RLS, triggers, indexes

- **API Agent** (`api-agent.md`)
  - **Focus:** API routes, webhooks, Stripe integration
  - **Scope:** `app/api/`, `lib/stripe/`
  - **Expertise:** Next.js App Router, Stripe API, validation

- **Frontend Agent** (`frontend-agent.md`)
  - **Focus:** Pages, components, UI/UX
  - **Scope:** `app/`, UI components
  - **Expertise:** React, Tailwind, SSR patterns, pricing flows

- **Deployment Agent** (`deployment-agent.md`)
  - **Focus:** Deployment automation, environment setup
  - **Scope:** `scripts/`, deployment docs
  - **Expertise:** Vercel, Supabase provisioning, CI/CD

### How Commands Use Sub-Agents

Commands orchestrate sub-agents in sequence:

```
/build-saas
  └─> Schema Agent (migrations)
      └─> API Agent (routes + Stripe)
          └─> Frontend Agent (pages)
              └─> Deployment Agent (plan)
```

### Invoking Sub-Agents Directly

You can invoke sub-agents by name in conversation:

```
"Use Schema Agent to add a comments table with RLS"
"Let API Agent generate the webhook handler"
"Ask Frontend Agent to create a dashboard page"
```

## Skills (Deprecated)

Legacy skills have been consolidated into sub-agents. See `.claude/skills/.deprecated/` for archive.

## MCP Integration

Commands can leverage MCP servers for external integrations:

- **Supabase MCP:** Database operations, migrations
- **Stripe MCP:** Payment processing, webhooks

See `../.claude.json` for MCP configuration.

## Memory

Claude Code's memory system automatically tracks:

- Project configuration (Supabase/Stripe IDs)
- Integration details (webhooks, price IDs)
- Deployment history

Create memories explicitly for important context that should persist across sessions.

## Best Practices

**Commands:**
- Keep focused on a single workflow
- Provide troubleshooting sections
- Link to relevant documentation
- Include examples

**Skills:**
- Make them composable
- Document inputs/outputs clearly
- Test with various scenarios

**Memory:**
- Record configuration changes
- Track deployment outcomes
- Document non-obvious decisions
- Avoid storing secrets

## Resources

- [CLAUDE.md](../CLAUDE.md) - Full integration documentation
- [Slash Commands Docs](https://docs.claude.com/en/docs/claude-code/slash-commands)
- [MCP Documentation](https://docs.anthropic.com/en/docs/model-context-protocol)
