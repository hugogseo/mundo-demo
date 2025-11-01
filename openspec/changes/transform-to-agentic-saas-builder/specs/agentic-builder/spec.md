# agentic-builder Specification Deltas

**Note**: This spec defines the agentic SaaS builder system integrated with Claude Code. This is NOT a standalone product with its own UI—it leverages Claude Code's slash commands, MCP servers, and memory system.

## ADDED Requirements

### Requirement: Natural Language Intent Parsing
The system SHALL accept natural language descriptions of SaaS ideas and extract structured requirements including entities, relationships, operations, and business rules.

#### Scenario: Extract entities from business description
- **WHEN** user provides "I want freelancers to create invoices for clients"
- **THEN** system identifies entities: User(role:freelancer), Invoice, Client
- **AND** infers relationships: User 1:N Invoice, Invoice N:1 Client
- **AND** extracts operations: CreateInvoice, ViewInvoice, SendInvoice

#### Scenario: Identify ambiguities requiring clarification
- **WHEN** parsed intent has multiple valid interpretations
- **THEN** system generates business-level clarification questions
- **AND** questions are phrased without technical jargon
- **AND** provides sensible defaults for each option

### Requirement: Sub-Agent Orchestration
The system SHALL coordinate specialized sub-agents (Schema, API, Frontend, Deployment) to generate complete SaaS applications based on parsed intent.

#### Scenario: Parallel sub-agent execution
- **WHEN** orchestrator receives parsed intent
- **THEN** dispatches tasks to Schema, API, and Frontend agents in parallel
- **AND** manages dependencies (e.g., API agent waits for Schema agent completion)
- **AND** aggregates results into cohesive codebase

#### Scenario: Sub-agent failure recovery
- **WHEN** a sub-agent fails during execution
- **THEN** system retries with refined context (up to 2 attempts)
- **AND** if retry fails, prompts user with simplified options
- **AND** allows continuing with partial generation

### Requirement: Schema Agent
The system SHALL provide a Schema Agent that generates Supabase database schemas, RLS policies, and TypeScript types based on identified business entities.

#### Scenario: Generate schema from entities
- **WHEN** Schema Agent receives entities [User, Invoice, Client]
- **THEN** creates Supabase migration with appropriate tables
- **AND** infers column types from entity attributes (e.g., amount → DECIMAL)
- **AND** applies RLS policies following least-privilege principle
- **AND** generates TypeScript types matching schema

#### Scenario: Handle entity relationships
- **WHEN** entities have relationships (1:N, N:1, N:M)
- **THEN** creates foreign key constraints
- **AND** adds indexes on foreign key columns
- **AND** generates junction tables for N:M relationships

### Requirement: API Agent
The system SHALL provide an API Agent that generates Next.js API routes, authentication logic, and Stripe integrations based on business operations.

#### Scenario: Generate CRUD endpoints
- **WHEN** API Agent receives operations [CreateInvoice, UpdateInvoice, DeleteInvoice]
- **THEN** creates REST API routes under `/app/api/invoices/`
- **AND** implements authentication checks using Supabase
- **AND** validates request bodies against TypeScript types
- **AND** returns appropriate HTTP status codes and error messages

#### Scenario: Integrate Stripe for payments
- **WHEN** operations include payment processing
- **THEN** generates Stripe checkout session endpoint
- **AND** implements webhook handler for payment events
- **AND** syncs payment status with database

### Requirement: Frontend Agent
The system SHALL provide a Frontend Agent that generates React components, pages, and forms with accessible, responsive UI.

#### Scenario: Generate dashboard with CRUD UI
- **WHEN** Frontend Agent receives entities and operations
- **THEN** creates dashboard page under `/app/dashboard/`
- **AND** generates data table with pagination and filtering
- **AND** creates modal forms for create/edit operations
- **AND** applies Tailwind CSS with consistent design system

#### Scenario: Implement user workflows
- **WHEN** workflows are specified (e.g., "approve invoice")
- **THEN** generates multi-step wizards or approval flows
- **AND** includes validation feedback and loading states
- **AND** follows accessibility best practices (ARIA labels, keyboard navigation)

### Requirement: Deployment Agent
The system SHALL provide a Deployment Agent that configures hosting (Vercel), database (Supabase), and environment variables for one-command deployment.

#### Scenario: Automated Vercel deployment
- **WHEN** Deployment Agent receives completed codebase
- **THEN** initializes git repository if not exists
- **AND** creates Vercel project with optimal settings
- **AND** configures environment variables from generated `.env`
- **AND** triggers initial deployment and returns preview URL

#### Scenario: Supabase project setup
- **WHEN** deploying to production
- **THEN** creates Supabase hosted project
- **AND** runs migrations against production database
- **AND** configures RLS policies
- **AND** provides connection credentials

### Requirement: Human-in-the-Loop (HITL) Refinement
The system SHALL present strategic clarification questions to users at business-logic decision points, avoiding technical jargon.

#### Scenario: Business-level clarification
- **WHEN** system needs clarification on business logic (e.g., payment guest checkout vs required accounts)
- **THEN** presents question in user's domain language
- **AND** provides 2-4 clear options
- **AND** includes smart default selection

#### Scenario: Apply technical defaults
- **WHEN** system needs technical decision (e.g., index strategy, RLS policy pattern)
- **THEN** applies best-practice default without prompting user
- **AND** logs decision in generated documentation

### Requirement: Context Management
The system SHALL provide basic context scoping per sub-agent to minimize irrelevant information in agent prompts.

#### Scenario: Scoped sub-agent context
- **WHEN** sub-agent is invoked
- **THEN** receives only relevant subset of global context (entities, operations relevant to that agent)
- **AND** generated code from dependent agents is included
- **AND** boilerplate structure is referenced without full duplication

### Requirement: Code Validation
The system SHALL validate all generated code against TypeScript compiler to catch syntax/type errors before finalizing.

#### Scenario: TypeScript compilation check
- **WHEN** code generation completes
- **THEN** runs `tsc --noEmit` on all TypeScript files
- **AND** reports compilation errors with file/line context
- **AND** provides actionable error messages for user to fix

### Requirement: Conversational Refinement Loop
The system SHALL support iterative refinement through natural language conversation, allowing users to request modifications to generated SaaS.

#### Scenario: Request feature addition
- **WHEN** user says "Add recurring billing to invoices"
- **THEN** parses addition as delta to existing intent
- **AND** re-runs affected sub-agents (Schema, API, Frontend)
- **AND** merges changes into existing codebase without breaking existing features

#### Scenario: Request UI modification
- **WHEN** user says "Make the dashboard sidebar collapsible"
- **THEN** identifies affected components
- **AND** applies modification using Frontend Agent
- **AND** preserves custom user changes if any

### Requirement: Basic Documentation
The system SHALL generate minimal technical documentation describing the generated SaaS structure.

#### Scenario: Architecture overview
- **WHEN** SaaS generation completes
- **THEN** creates `ARCHITECTURE.md` explaining database schema, API endpoints, and component structure
- **AND** documents key technical decisions made by agents (RLS policies, auth flow, payment setup)
- **AND** provides deployment instructions
