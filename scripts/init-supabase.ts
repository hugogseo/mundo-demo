#!/usr/bin/env tsx
/**
 * Supabase project initialization automation
 * Creates a hosted Supabase project via Management API, retrieves API keys,
 * and optionally applies migrations using the Supabase CLI.
 */

import { execSync } from 'child_process';

const MANAGEMENT_URL = 'https://api.supabase.com';

interface SupabaseProject {
  id: string;
  ref: string;
  status: string;
  name: string;
  organization_id: string;
  database?: {
    host?: string;
    port?: number;
  };
}

interface ApiKeysResponse {
  anon_api_key: string;
  service_api_key: string;
}

const REQUIRED_ENV = ['SUPABASE_ACCESS_TOKEN', 'SUPABASE_ORG_ID', 'SUPABASE_DB_PASSWORD'] as const;

type RequiredEnvKey = (typeof REQUIRED_ENV)[number];

type EnvMap = Record<RequiredEnvKey, string>;

function validateEnv(): EnvMap {
  const missing: string[] = [];
  const values = {} as EnvMap;

  for (const key of REQUIRED_ENV) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
    } else {
      values[key] = value;
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables for Supabase initialization:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('\nSet them in your shell or .env.local before running this script.');
    process.exit(1);
  }

  return values;
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = process.env.SUPABASE_ACCESS_TOKEN!;

  const response = await fetch(`${MANAGEMENT_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase API ${response.status}: ${errorText}`);
  }

  return (await response.json()) as T;
}

async function createProject(): Promise<SupabaseProject> {
  const existingRef = process.env.SUPABASE_PROJECT_REF;
  if (existingRef) {
    console.log(`ℹ️  Using existing Supabase project: ${existingRef}`);
    return supabaseRequest<SupabaseProject>(`/v1/projects/${existingRef}`);
  }

  console.log('📦 Creating Supabase project...');

  const projectName = process.env.SUPABASE_PROJECT_NAME ?? 'agentic-saas-db';
  const region = process.env.SUPABASE_REGION ?? 'us-east-1';
  const plan = process.env.SUPABASE_PLAN ?? 'free';

  const payload = {
    organization_id: process.env.SUPABASE_ORG_ID!,
    name: projectName,
    db_password: process.env.SUPABASE_DB_PASSWORD!,
    region,
    plan,
  };

  return supabaseRequest<SupabaseProject>('/v1/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function waitForReady(ref: string): Promise<void> {
  console.log('⏳ Waiting for Supabase project to become ready...');
  const maxAttempts = 30;
  const delayMs = 10_000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const project = await supabaseRequest<SupabaseProject>(`/v1/projects/${ref}`);
    const status = project.status?.toUpperCase();
    if (status === 'ACTIVE' || status === 'READY') {
      console.log('✓ Supabase project is ready');
      return;
    }

    console.log(`   • Status: ${project.status ?? 'unknown'} (attempt ${attempt}/${maxAttempts})`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error('Supabase project did not become ready within expected time window');
}

async function fetchApiKeys(ref: string): Promise<ApiKeysResponse> {
  console.log('🔑 Fetching Supabase API keys...');
  return supabaseRequest<ApiKeysResponse>(`/v1/projects/${ref}/api-keys`);
}

function maybeApplyMigrations(ref: string): void {
  if (process.env.SUPABASE_APPLY_MIGRATIONS !== 'true') {
    console.log('ℹ️  Skipping migration apply (set SUPABASE_APPLY_MIGRATIONS=true to enable).');
    return;
  }

  try {
    console.log('📚 Applying migrations using Supabase CLI...');
    execSync(`supabase db push --project-ref ${ref}`, { stdio: 'inherit' });
    console.log('✓ Migrations applied');
  } catch (err: any) {
    console.warn('⚠️  Failed to apply migrations via Supabase CLI. Install @supabase/cli and try again.');
    console.warn(err?.message ?? err);
  }
}

async function main() {
  console.log('🔧 Agentic Supabase Initialization\n');
  validateEnv();

  const project = await createProject();
  const ref = project.ref;
  console.log(`✓ Supabase project ref: ${ref}`);

  await waitForReady(ref);

  const keys = await fetchApiKeys(ref);

  console.log('\n✅ Supabase project ready!');
  console.log(`   Project Name: ${project.name}`);
  console.log(`   Project Ref: ${ref}`);
  console.log(`   Region: ${process.env.SUPABASE_REGION ?? 'us-east-1'} (override with SUPABASE_REGION)`);
  console.log(`   Plan: ${process.env.SUPABASE_PLAN ?? 'free'} (override with SUPABASE_PLAN)`);

  console.log('\n🔐 API Keys (store securely):');
  console.log(`   NEXT_PUBLIC_SUPABASE_URL=https://${ref}.supabase.co`);
  console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY=${keys.anon_api_key}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY=${keys.service_api_key}`);

  maybeApplyMigrations(ref);

  console.log('\n📋 Next steps:');
  console.log('   1. Update environment variables with the values above');
  console.log('   2. Configure Vercel deploy (npm run agentic:deploy)');
  console.log('   3. Set STRIPE_WEBHOOK_SECRET after first deploy');
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
