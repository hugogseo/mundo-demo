---
description: Configure Supabase project with MCP tools, apply migrations, and set up RLS policies
allowed-tools: Read, Edit, Write, MCPTool
---

# Setup Supabase Integration

This command sets up Supabase database, auth, and storage using the Supabase MCP server.

## What it does

1. Creates or connects to a Supabase project via MCP
2. Applies database migrations (schema + RLS policies)
3. Configures authentication providers
4. Sets up storage buckets if needed
5. Generates TypeScript types from schema
6. Updates environment variables

## Prerequisites

Before running this command, ensure:
- You have a Supabase account
- Supabase MCP server is configured in `.claude.json`
- You have decided on a project name and region

## Steps

### 1. Verify MCP Connection
Check that the Supabase MCP server is accessible:
```bash
claude mcp list
```
You should see `supabase` in the list.

### 2. Create or Connect Project (via MCP)
Use Supabase MCP tools to:
- **Option A (New Project):** Create a new hosted project
  - Name: Your app name
  - Region: Closest to your users (e.g., `us-east-1`)
  - Database password: Generate strong password

- **Option B (Existing Project):** Connect to existing project
  - Provide project reference ID
  - Retrieve connection details

### 3. Set Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (server-side only)
```

### 4. Initialize Supabase Local
- Check if `supabase/config.toml` exists
- If not, propose: `npx supabase init`
- Start local services: `npx supabase start`
- Capture credentials (anon key, service key, DB URL)

### 5. Create Profiles & Subscriptions Schema
- Invoke **Schema Agent** to generate:
  - `profiles` table (extends `auth.users`)
  - `subscriptions` table (links Stripe subscriptions)
  - RLS policies for user/admin access
  - Triggers (updated_at) and verification SQL
- Schema Agent will save migrations to `supabase/migrations/`

### 6. Configure Auth Providers (via MCP)
Enable authentication methods:
- Email/Password (default)
- Magic Link
- OAuth providers (Google, GitHub, etc.) if needed

Update redirect URLs:
- Development: `http://localhost:3000/auth/callback`
- Production: `https://your-app.vercel.app/auth/callback`

### 6. Generate TypeScript Types
Use MCP or CLI to generate types:
```bash
npx supabase gen types typescript --project-id xxx > types/database.ts
```

Or via MCP tools if available.

### 7. Set Up RLS Policies
Verify Row Level Security is enabled:
- All user-scoped tables should have policies for `auth.uid()`
- Service role key bypasses RLS (use carefully)
- Test policies with different user contexts

Example RLS policy (already in migrations):
```sql
CREATE POLICY "users_own_data" ON profiles
  FOR ALL USING (auth.uid() = id);
```

### 8. Test Connection
Run the app and verify:
```bash
npm run dev
```
- Sign up a new user
- Check that profile is created
- Verify CRUD operations respect RLS

## Troubleshooting

**MCP connection failed:**
- Ensure `.claude.json` has correct Supabase MCP URL
- Check internet connection
- Verify Supabase access token if required

**Migrations fail to apply:**
- Check migration syntax (use Supabase SQL editor to test)
- Ensure migrations run in correct order
- Look for conflicting table/policy names

**RLS blocking queries:**
- Verify `auth.uid()` is set (user must be authenticated)
- Check policy conditions match your use case
- Use service role key for admin operations (server-side only)

**TypeScript types outdated:**
- Re-run type generation after schema changes
- Restart TypeScript server in IDE
- Clear `.next` cache if using Next.js

## Storage Setup (Optional)

If your app needs file uploads:

1. Create storage bucket via MCP:
   - Name: `avatars`, `documents`, etc.
   - Public or private access
   - File size limits

2. Set RLS policies on storage:
```sql
CREATE POLICY "users_upload_own_files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

3. Generate signed URLs for private files

## Memory

Save key details for future reference:
- Supabase project ID and region
- Database connection strings
- Auth provider configuration
- Storage bucket names and policies
- Date of last migration applied
- RLS policy structure overview

## Next Steps

After setup:
1. Configure email templates in Supabase dashboard
2. Set up database backups (automatic on paid plans)
3. Monitor usage and set up alerts
4. Enable realtime subscriptions if needed
5. Configure connection pooling for production
