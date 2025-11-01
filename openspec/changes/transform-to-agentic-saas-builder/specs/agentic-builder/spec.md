# agentic-builder Specification Deltas

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
- **WHEN** system needs clarification on business logic
- **THEN** presents question in user's domain language
- **AND** provides 2-4 clear options with examples
- **AND** includes smart default selection
- **AND** allows skipping with "use defaults" option

#### Scenario: Avoid technical questions
- **WHEN** system needs technical decision (e.g., index strategy)
- **THEN** applies best-practice default without prompting user
- **AND** logs decision in generated documentation
- **AND** allows expert users to override via config file

### Requirement: Context Efficiency
The system SHALL optimize context usage through scoped sub-agent contexts, prompt caching, and checkpointing to support long-running build sessions.

#### Scenario: Scoped sub-agent context
- **WHEN** sub-agent is invoked
- **THEN** receives only relevant subset of global context
- **AND** boilerplate structure is cached across requests
- **AND** generated code from dependent agents is included

#### Scenario: Checkpoint progress
- **WHEN** generation session exceeds 5 minutes
- **THEN** system checkpoints completed sub-agent outputs
- **AND** allows resuming from last checkpoint if interrupted
- **AND** user can review/edit checkpoint before continuing

### Requirement: Validation and Testing
The system SHALL validate all generated code against TypeScript compiler, run automated tests, and provide preview environment before finalizing.

#### Scenario: TypeScript validation
- **WHEN** code generation completes
- **THEN** runs `tsc --noEmit` on all TypeScript files
- **AND** reports compilation errors with context
- **AND** automatically fixes common issues (missing imports, type mismatches)

#### Scenario: Automated testing
- **WHEN** validation passes
- **THEN** generates basic tests for each API endpoint
- **AND** runs test suite to verify correctness
- **AND** provides test coverage report

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

### Requirement: Documentation Generation
The system SHALL automatically generate user-facing documentation explaining the generated SaaS architecture, features, and customization guide.

#### Scenario: Architecture documentation
- **WHEN** SaaS generation completes
- **THEN** creates `ARCHITECTURE.md` explaining database schema, API endpoints, and UI structure
- **AND** includes diagrams (entity-relationship, API flow)
- **AND** documents all technical decisions made by agents

#### Scenario: User guide
- **WHEN** SaaS generation completes
- **THEN** creates `USER_GUIDE.md` for end-users of the SaaS
- **AND** explains how to use each feature in plain language
- **AND** includes screenshots of key workflows
