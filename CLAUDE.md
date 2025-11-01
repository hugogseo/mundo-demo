<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

---

# Agentic SaaS Boilerplate - Claude Code Integration

This project is designed to work seamlessly with Claude Code through MCPs, slash commands, and memory.

## MCP Servers

Model Context Protocol (MCP) servers extend Claude's capabilities with external tools and data sources.

### Configured MCPs

This boilerplate integrates with:

#### Supabase MCP
- **Purpose:** Database operations, migrations, auth configuration
- **URL:** `https://mcp.supabase.com/mcp`
- **Capabilities:**
  - Execute SQL queries
  - Apply migrations
  - Manage projects and branches
  - Configure authentication providers
  - Generate TypeScript types

#### Stripe MCP  
- **Purpose:** Payment processing, webhooks, product management
- **URL:** `https://mcp.stripe.com`
- **Capabilities:**
  - Create/update products and prices
  - Manage webhook endpoints
  - Test payment flows
  - View transactions and customers

### Setup

The MCP configuration is in `.claude.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    },
    "stripe": {
      "type": "http",
      "url": "https://mcp.stripe.com"
    }
  }
}
```

**Verify MCPs are loaded:**
```bash
claude mcp list
```

You should see both `supabase` and `stripe` listed.

**Alternative CLI setup:**
```bash
claude mcp add --transport http supabase "https://mcp.supabase.com/mcp"
claude mcp add --transport http stripe "https://mcp.stripe.com"
```

## Slash Commands

Slash commands provide guided workflows for common tasks.

### Available Commands

#### `/setup-supabase`
Configure Supabase database with migrations and RLS policies.
- Creates/connects to project via MCP
- Applies all migrations
- Sets up authentication
- Generates TypeScript types

#### `/setup-stripe`
Configure Stripe payments and webhooks.
- Validates API keys
- Creates webhook endpoints via MCP
- Generates payment artifacts
- Sets up test products and prices

#### `/deploy-full`
Full production deployment orchestration.
- Pre-flight checks (env vars, MCPs)
- Applies Supabase migrations
- Configures Stripe webhooks
- Deploys to Vercel
- Runs validation tests

#### `/build-saas`
Generate a complete SaaS from natural language description.
- Parses intent (entities, operations)
- Generates schema + RLS
- Creates API routes
- Builds frontend components
- Includes Stripe integration if payments mentioned

#### `/refine-saas`
Iteratively refine generated SaaS.
- Accepts delta descriptions
- Re-runs affected agents
- Merges changes safely

#### `/audit-security`
Security audit focusing on API routes and middleware.
- Scans for missing Origin/Referer checks
- Recommends rate limiting
- Validates environment variable usage

### Using Slash Commands

In Claude Code chat:
```
/setup-supabase
```

Or with arguments:
```
/build-saas --desc "Freelancers create invoices for clients with Stripe payments"
```

## Memory System

Claude Code's memory system preserves important context across sessions.

### What to Remember

The boilerplate automatically tracks:

**Project Configuration:**
- Supabase project ID and region
- Stripe account mode (test/live)
- Vercel deployment URLs
- Environment variable structure

**Integration Details:**
- Webhook endpoint IDs
- Price IDs for subscription tiers
- Auth provider configurations
- Database migration versions

**Deployment History:**
- Last deployment date/time
- Issues encountered and resolutions
- Performance baselines

### Creating Memories

When you set up or modify the project, create memory entries:

**Example: Supabase Setup**
```
Title: Supabase Production Configuration
Content: 
- Project ID: abc123xyz
- Region: us-east-1
- Migrations: up to date as of 2024-10-31
- RLS enabled on all tables
- Auth: Email/password + Google OAuth
```

**Example: Stripe Integration**
```
Title: Stripe Payment Configuration
Content:
- Mode: Test (switch to live before production deploy)
- Webhook ID: we_abc123
- Price IDs:
  - Pro Monthly: price_123
  - Enterprise Monthly: price_456
- Last tested: 2024-10-31, all flows working
```

### Accessing Memories

Memories are automatically retrieved when relevant to your request. You can also explicitly reference them:

```
@memory Supabase Production Configuration
```

## Agentic Architecture

This boilerplate implements an agentic architecture where specialized sub-agents handle different concerns:

### Sub-Agents

**SchemaAgent** (`lib/agentic/agents/schema-agent.ts`)
- Generates Supabase migrations
- Creates RLS policies
- Produces TypeScript types

**ApiAgent** (`lib/agentic/agents/api-agent.ts`)
- Generates CRUD API routes
- Adds Stripe checkout/webhook handlers
- Handles authentication checks

**FrontendAgent** (`lib/agentic/agents/frontend-agent.ts`)
- Creates React components (forms, tables)
- Generates pages
- Adds pricing/checkout UI if payments needed

**DeploymentAgent** (`lib/agentic/agents/deployment-agent.ts`)
- Produces deployment plans
- Generates environment templates
- Creates deployment checklists

### Orchestration

The orchestrator (`lib/agentic/orchestrator.ts`) coordinates sub-agents:

```typescript
import orchestrate from '@/lib/agentic/orchestrator';

const result = await orchestrate(
  "Freelancers create invoices for clients",
  { withDeployment: true }
);

// result.artifacts contains all generated files
```

### CLI Tools

**Orchestrate:**
```bash
npm run agentic:orchestrate -- --desc "Your SaaS idea" [--apply] [--with-deployment]
```

**Refine:**
```bash
npm run agentic:refine -- --delta "Add recurring billing" [--apply]
```

**Validate:**
```bash
npm run agentic:validate
```

## Best Practices

### When to Use MCPs

Use Supabase MCP when:
- Applying migrations to hosted projects
- Querying production database
- Managing auth providers
- Generating types from schema

Use Stripe MCP when:
- Creating products/prices in Stripe dashboard
- Configuring webhooks
- Testing payment flows
- Debugging transaction issues

### When to Use Slash Commands

Use slash commands for:
- Initial project setup (`/setup-supabase`, `/setup-stripe`)
- Full deployments (`/deploy-full`)
- Generating features (`/build-saas`, `/refine-saas`)
- Security audits (`/audit-security`)

### When to Use CLI Tools

Use CLI tools for:
- Local development iterations (`agentic:orchestrate`)
- Fine-tuning generated code (`agentic:refine`)
- Type checking (`agentic:validate`)
- Formatting (`npm run format`)

### Memory Best Practices

**Do:**
- Record key IDs (project, webhook, price IDs)
- Note deployment dates and outcomes
- Track configuration changes
- Document non-obvious decisions

**Don't:**
- Store sensitive secrets (use env vars)
- Duplicate information from code
- Create redundant memories

## Troubleshooting

### MCP Not Working

**Symptoms:** Commands fail with "MCP not found"

**Solutions:**
1. Verify `.claude.json` exists and is valid JSON
2. Run `claude mcp list` to check registration
3. Restart Claude Code
4. Re-add MCP via CLI

### Slash Command Not Found

**Symptoms:** `/command` not recognized

**Solutions:**
1. Check file exists in `.claude/commands/`
2. Verify YAML frontmatter is correct
3. Restart Claude Code to reload commands

### Memory Not Persisting

**Symptoms:** Context lost between sessions

**Solutions:**
1. Explicitly create memory after important changes
2. Use descriptive titles for easy retrieval
3. Tag memories with relevant keywords

## Resources

- [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
- [Stripe MCP Documentation](https://docs.stripe.com/mcp)
- [Claude Code Slash Commands](https://docs.claude.com/en/docs/claude-code/slash-commands)
- [Claude Code Memory](https://docs.claude.com/en/docs/claude-code/memory)
- [OpenSpec Workflow](./openspec/AGENTS.md)