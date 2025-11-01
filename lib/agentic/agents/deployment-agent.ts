import { AgentInput, AgentOutput, ArtifactFile, SubAgent } from '../types';

function deployPlanMarkdown(): string {
  return [
    '# Agentic Deploy Plan',
    '',
    'This plan outlines a safe, step-by-step deployment to Vercel (app) and Supabase (DB). No external commands are executed automatically.',
    '',
    '## Prerequisites',
    '- Vercel account with access to create projects',
    '- Supabase account (hosted project)',
    '- Stripe test keys (already used in local dev)',
    '',
    '## 1) Vercel Project',
    '1. Create a new project in Vercel and link this repo',
    '2. Set Environment Variables (see env list below)',
    '3. Framework Preset: Next.js',
    '4. Build Command: `next build`  Output: `.next`',
    '',
    '## 2) Supabase (Hosted)',
    '1. Create a new Supabase project',
    '2. Copy the URL and anon/service keys to Vercel envs',
    '3. Apply migrations from `supabase/migrations/` via SQL Editor or CI step',
    '',
    '## 3) Stripe Webhooks (Production)',
    '1. In Stripe Dashboard, add endpoint: `/api/webhooks/stripe`',
    '2. Capture the webhook secret and set `STRIPE_WEBHOOK_SECRET` in Vercel',
    '',
    '## 4) Deploy',
    '1. Trigger a Preview deploy',
    '2. Validate auth, DB access, and payments flow',
    '3. Promote to Production',
    '',
    '## Environment Variables (set in Vercel)',
    '- NEXT_PUBLIC_SUPABASE_URL',
    '- NEXT_PUBLIC_SUPABASE_ANON_KEY',
    '- SUPABASE_SERVICE_ROLE_KEY (Server only)',
    '- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    '- STRIPE_SECRET_KEY (Server only)',
    '- STRIPE_WEBHOOK_SECRET (Server only)',
  ].join('\n');
}

function envTemplate(): string {
  return [
    '# Copy these into Vercel project env settings',
    'NEXT_PUBLIC_SUPABASE_URL=',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
    'SUPABASE_SERVICE_ROLE_KEY=',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=',
    'STRIPE_SECRET_KEY=',
    'STRIPE_WEBHOOK_SECRET=',
    '',
    '# Optional app name',
    'NEXT_PUBLIC_APP_NAME=',
  ].join('\n');
}

function deployChecklist(): string {
  return [
    '# Deployment Checklist',
    '',
    '- [ ] Create Vercel project',
    '- [ ] Set environment variables',
    '- [ ] Create Supabase project (hosted)',
    '- [ ] Apply migrations',
    '- [ ] Configure Stripe webhook (prod)',
    '- [ ] Deploy preview',
    '- [ ] Validate flows (auth, CRUD, payments)',
    '- [ ] Promote to production',
  ].join('\n');
}

export class DeploymentAgent implements SubAgent {
  id = 'deployment-agent';

  async run(_input: AgentInput): Promise<AgentOutput> {
    try {
      const artifacts: ArtifactFile[] = [
        { path: 'agentic/deploy/DEPLOY_PLAN.md', content: deployPlanMarkdown() },
        { path: 'agentic/deploy/ENV_TEMPLATE', content: envTemplate() },
        { path: 'agentic/deploy/CHECKLIST.md', content: deployChecklist() },
      ];
      const notes = [
        'DeploymentAgent: generated deploy plan artifacts',
        'No external systems were changed; follow DEPLOY_PLAN.md manually or wire into CI.',
      ];
      return { status: 'ok', artifacts, logs: notes };
    } catch (e: any) {
      return { status: 'error', artifacts: [], error: e?.message ?? 'Unknown error' };
    }
  }
}

export default DeploymentAgent;
