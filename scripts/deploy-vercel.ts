#!/usr/bin/env tsx
/**
 * Automated Vercel deployment script
 * Requires: VERCEL_TOKEN, VERCEL_ORG_ID (optional VERCEL_PROJECT_ID for existing projects)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

type VercelEnvVar = {
  key: string;
  value: string;
  type: 'plain' | 'secret';
  target: ('production' | 'preview' | 'development')[];
};

const requiredEnvVars = [
  'VERCEL_TOKEN',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

function validateEnv(): void {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('\nSet them in your shell or .env file before running this script.');
    process.exit(1);
  }
}

async function createOrLinkProject(): Promise<string> {
  const token = process.env.VERCEL_TOKEN!;
  const orgId = process.env.VERCEL_ORG_ID;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (projectId) {
    console.log(`✓ Using existing Vercel project: ${projectId}`);
    return projectId;
  }

  console.log('📦 Creating new Vercel project...');
  const projectName = process.env.VERCEL_PROJECT_NAME || 'agentic-saas';

  const body: any = {
    name: projectName,
    framework: 'nextjs',
    buildCommand: 'next build',
    outputDirectory: '.next',
  };

  if (orgId) {
    body.teamId = orgId;
  }

  try {
    const response = await fetch('https://api.vercel.com/v9/projects', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create project: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log(`✓ Project created: ${data.id}`);
    return data.id;
  } catch (err: any) {
    console.error('❌ Error creating Vercel project:', err.message);
    process.exit(1);
  }
}

async function setEnvironmentVariables(projectId: string): Promise<void> {
  const token = process.env.VERCEL_TOKEN!;
  const orgId = process.env.VERCEL_ORG_ID;

  const envVars: VercelEnvVar[] = [
    {
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      value: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      type: 'plain',
      target: ['production', 'preview', 'development'],
    },
    {
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      type: 'plain',
      target: ['production', 'preview', 'development'],
    },
    {
      key: 'SUPABASE_SERVICE_ROLE_KEY',
      value: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      type: 'secret',
      target: ['production', 'preview'],
    },
    {
      key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      value: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
      type: 'plain',
      target: ['production', 'preview', 'development'],
    },
    {
      key: 'STRIPE_SECRET_KEY',
      value: process.env.STRIPE_SECRET_KEY!,
      type: 'secret',
      target: ['production', 'preview'],
    },
    {
      key: 'STRIPE_WEBHOOK_SECRET',
      value: process.env.STRIPE_WEBHOOK_SECRET!,
      type: 'secret',
      target: ['production', 'preview'],
    },
  ];

  if (process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY) {
    envVars.push({
      key: 'NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY',
      value: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
      type: 'plain',
      target: ['production', 'preview', 'development'],
    });
  }

  console.log(`📝 Setting ${envVars.length} environment variables...`);

  for (const envVar of envVars) {
    const url = orgId
      ? `https://api.vercel.com/v10/projects/${projectId}/env?teamId=${orgId}`
      : `https://api.vercel.com/v10/projects/${projectId}/env`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(envVar),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`⚠️  Failed to set ${envVar.key}: ${response.status} ${errorText}`);
      } else {
        console.log(`   ✓ ${envVar.key}`);
      }
    } catch (err: any) {
      console.warn(`⚠️  Error setting ${envVar.key}:`, err.message);
    }
  }
}

async function triggerDeployment(projectId: string): Promise<string> {
  console.log('🚀 Triggering Vercel deployment...');

  try {
    const cwd = process.cwd();
    const orgFlag = process.env.VERCEL_ORG_ID ? `--scope ${process.env.VERCEL_ORG_ID}` : '';
    const cmd = `vercel deploy --token ${process.env.VERCEL_TOKEN} ${orgFlag} --yes`;

    const deployUrl = execSync(cmd, { cwd, encoding: 'utf-8' }).trim();
    console.log(`✓ Deployment triggered: ${deployUrl}`);
    return deployUrl;
  } catch (err: any) {
    console.error('❌ Deployment failed:', err.message);
    process.exit(1);
  }
}

async function main() {
  console.log('🔧 Agentic Vercel Auto-Deploy\n');

  validateEnv();

  const projectId = await createOrLinkProject();
  await setEnvironmentVariables(projectId);
  const deployUrl = await triggerDeployment(projectId);

  console.log('\n✅ Deployment complete!');
  console.log(`   Preview URL: ${deployUrl}`);
  console.log('\n📋 Next steps:');
  console.log('   1. Validate the preview deployment');
  console.log('   2. Configure Stripe webhook endpoint (if not already set)');
  console.log('   3. Promote to production via Vercel dashboard');
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
