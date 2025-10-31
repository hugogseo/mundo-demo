---
name: supabase-migrations-and-rls
description: Generate safe SQL migrations for profiles/subscriptions with RLS, triggers and policies. Use when creating new tables, adding columns, or adjusting auth/row policies.
allowed-tools: Read, Write, Edit, Grep, Glob
---

# Supabase Migrations & RLS

## Tasks
- Create migrations under `/supabase/migrations` with PL/pgSQL
- Ensure RLS and minimal policies
- Keep triggers (updated_at, sync membership) consistent
- Offer downgrade script if needed

## Steps
1. Inspect current migration files for enums, triggers, grants.
2. Draft a new migration with: CREATE TABLE, RLS ENABLE, SELECT/UPDATE own row policies, service_role policies.
3. Propose removing "Public profiles viewable" policy if privacy required.
4. Generate verification SQL (SELECTs) and add it to docs.
