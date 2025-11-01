# Claude Code Integration

This directory contains Claude Code-specific configuration, commands, and skills.

## Structure

```
.claude/
├── commands/          # Slash commands for guided workflows
│   ├── setup-supabase.md
│   ├── setup-stripe.md
│   ├── deploy-full.md
│   ├── build-saas.md
│   ├── refine-saas.md
│   └── audit-security.md
├── skills/            # Reusable skills (future)
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

## Skills

Skills are reusable code generation patterns. Coming soon.

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
