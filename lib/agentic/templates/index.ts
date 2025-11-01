import { Entity, Relationship, Operation, ArtifactFile } from '../types';

const STRIPE_API_VERSION = '2024-06-20';

function compile(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => String(vars[k] ?? ''));
}

export function generateEntityFormComponent(entity: Entity): ArtifactFile {
  const compName = entity.name.charAt(0).toUpperCase() + entity.name.slice(1);
  const dir = `app/${entity.name.toLowerCase()}s/components`;
  const content = [
    '"use client"',
    '',
    'type Props = {',
    '  draft: Record<string, any>',
    '  setDraft: (v: Record<string, any>) => void',
    '  onSubmit: (e: any) => Promise<void>',
    '}',
    '',
    `export default function ${compName}Form({ draft, setDraft, onSubmit }: Props) {`,
    '  return (',
    '    <form onSubmit={onSubmit} className="flex items-center gap-2">',
    '      <input',
    '        className="border rounded px-2 py-1"',
    '        placeholder="name"',
    '        value={draft.name || ""}',
    '        onChange={(e) => setDraft({ ...draft, name: e.target.value })}',
    '      />',
    '      <button className="px-3 py-1 rounded bg-black text-white" type="submit">Create</button>',
    '    </form>',
    '  )',
    '}',
  ].join('\n');
  return { path: `${dir}/${compName}Form.tsx`, content };
}

export function generateEntityTableComponent(entity: Entity): ArtifactFile {
  const compName = entity.name.charAt(0).toUpperCase() + entity.name.slice(1);
  const dir = `app/${entity.name.toLowerCase()}s/components`;
  const content = [
    '"use client"',
    '',
    'type Props = { items: Array<Record<string, any>> }',
    '',
    `export default function ${compName}Table({ items }: Props) {`,
    '  return (',
    '    <table className="w-full border">',
    '      <thead>',
    '        <tr className="bg-gray-50">',
    '          <th className="text-left p-2">ID</th>',
    '          <th className="text-left p-2">Name</th>',
    '        </tr>',
    '      </thead>',
    '      <tbody>',
    '        {items.map((it) => (',
    '          <tr key={it.id} className="border-t">',
    '            <td className="p-2">{it.id}</td>',
    '            <td className="p-2">{it.name || "—"}</td>',
    '          </tr>',
    '        ))}',
    '      </tbody>',
    '    </table>',
    '  )',
    '}',
  ].join('\n');
  return { path: `${dir}/${compName}Table.tsx`, content };
}

function sqlTypeFrom(attrType?: string): string {
  const t = (attrType || 'text').toLowerCase();
  if (t === 'uuid') return 'uuid';
  if (t === 'int' || t === 'integer') return 'integer';
  if (t === 'number' || t === 'numeric' || t === 'decimal') return 'numeric';
  if (t === 'boolean' || t === 'bool') return 'boolean';
  if (t === 'json' || t === 'jsonb') return 'jsonb';
  if (t === 'date' || t === 'timestamp' || t === 'timestamptz') return 'timestamptz';
  return 'text';
}

function tsTypeFrom(attrType?: string): string {
  const t = (attrType || 'string').toLowerCase();
  if (t === 'uuid') return 'string';
  if (t === 'int' || t === 'integer' || t === 'number' || t === 'numeric' || t === 'decimal') return 'number';
  if (t === 'boolean' || t === 'bool') return 'boolean';
  if (t === 'json' || t === 'jsonb') return 'any';
  if (t === 'date' || t === 'timestamp' || t === 'timestamptz') return 'string';
  return 'string';
}

export function generateMigration(entities: Entity[], relationships: Relationship[]): ArtifactFile {
  const lines: string[] = [];
  lines.push('-- Agentic generated migration');
  lines.push('BEGIN;');
  lines.push('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  for (const e of entities) {
    const table = e.name.toLowerCase() + 's';
    const cols: string[] = [];
    cols.push('  id uuid PRIMARY KEY DEFAULT uuid_generate_v4()');
    cols.push('  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE');
    if (e.attributes) {
      for (const [attr, type] of Object.entries(e.attributes)) {
        cols.push(`  ${attr} ${sqlTypeFrom(type)}`);
      }
    }
    cols.push('  created_at timestamptz NOT NULL DEFAULT now()');
    cols.push('  updated_at timestamptz NOT NULL DEFAULT now()');
    lines.push(`CREATE TABLE IF NOT EXISTS public.${table} (\n${cols.join(',\n')}\n);`);
    lines.push(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    lines.push(`CREATE POLICY "${table}_select_own" ON public.${table} FOR SELECT USING (auth.uid() = user_id);`);
    lines.push(`CREATE POLICY "${table}_insert_own" ON public.${table} FOR INSERT WITH CHECK (auth.uid() = user_id);`);
    lines.push(`CREATE POLICY "${table}_update_own" ON public.${table} FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);`);
    lines.push(`CREATE POLICY "${table}_delete_own" ON public.${table} FOR DELETE USING (auth.uid() = user_id);`);
    lines.push(`CREATE INDEX IF NOT EXISTS idx_${table}_user_id ON public.${table}(user_id);`);
  }
  for (const r of relationships) {
    if (r.type === 'many-to-one') {
      const from = r.from.toLowerCase() + 's';
      const to = r.to.toLowerCase() + 's';
      lines.push(`ALTER TABLE public.${from} ADD COLUMN IF NOT EXISTS ${r.to.toLowerCase()}_id uuid REFERENCES public.${to}(id);`);
      lines.push(`CREATE INDEX IF NOT EXISTS idx_${from}_${r.to.toLowerCase()}_id ON public.${from} (${r.to.toLowerCase()}_id);`);
    }
  }
  lines.push('COMMIT;');
  return { path: 'supabase/migrations/agentic_generated.sql', content: lines.join('\n') };
}

export function generateApiRoute(op: Operation): ArtifactFile {
  const name = (op.name || 'Operation').toLowerCase();
  const content = [
    "import { NextResponse } from 'next/server'",
    '',
    'export async function POST(req: Request) {',
    `  return NextResponse.json({ operation: '${op.name}' })`,
    '}',
  ].join('\n');
  return { path: `app/api/${name}/route.ts`, content };
}

export function generateCrudRoutes(entity: Entity): ArtifactFile[] {
  const table = entity.name.toLowerCase() + 's';
  const collectionPath = `app/api/${table}/route.ts`;
  const itemPath = `app/api/${table}/[id]/route.ts`;

  const collectionContent = [
    "import { NextResponse } from 'next/server'",
    "import { createClient } from '@/lib/supabase/server'",
    '',
    'export async function GET() {',
    '  const supabase = await createClient();',
    '  const { data: { user } } = await supabase.auth.getUser();',
    "  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });",
    `  const { data, error } = await supabase.from('${table}').select('*');`,
    '  if (error) return NextResponse.json({ error: error.message }, { status: 500 });',
    '  return NextResponse.json(data || []);',
    '}',
    '',
    'export async function POST(req: Request) {',
    '  const supabase = await createClient();',
    '  const { data: { user } } = await supabase.auth.getUser();',
    "  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });",
    '  const body = await req.json();',
    `  const payload = { ...body, user_id: user.id };`,
    `  const { data, error } = await supabase.from('${table}').insert(payload).select().maybeSingle();`,
    '  if (error) return NextResponse.json({ error: error.message }, { status: 400 });',
    '  return NextResponse.json(data);',
    '}',
  ].join('\n');

  const itemContent = [
    "import { NextResponse } from 'next/server'",
    "import { createClient } from '@/lib/supabase/server'",
    '',
    'type Params = { params: { id: string } }',
    '',
    'export async function GET(_: Request, { params }: Params) {',
    '  const supabase = await createClient();',
    '  const { data, error } = await supabase',
    `    .from('${table}')`,
    "    .select('*')",
    '    .eq(' + "'id'" + ', params.id)',
    '    .maybeSingle();',
    '  if (error) return NextResponse.json({ error: error.message }, { status: 404 });',
    '  return NextResponse.json(data);',
    '}',
    '',
    'export async function PUT(req: Request, { params }: Params) {',
    '  const supabase = await createClient();',
    '  const body = await req.json();',
    `  const { data, error } = await supabase.from('${table}').update(body).eq('id', params.id).select().maybeSingle();`,
    '  if (error) return NextResponse.json({ error: error.message }, { status: 400 });',
    '  return NextResponse.json(data);',
    '}',
    '',
    'export async function DELETE(_: Request, { params }: Params) {',
    '  const supabase = await createClient();',
    `  const { error } = await supabase.from('${table}').delete().eq('id', params.id);`,
    '  if (error) return NextResponse.json({ error: error.message }, { status: 400 });',
    '  return NextResponse.json({ ok: true });',
    '}',
  ].join('\n');

  return [
    { path: collectionPath, content: collectionContent },
    { path: itemPath, content: itemContent },
  ];
}

export function generateReactPage(entity: Entity): ArtifactFile {
  const compName = entity.name.charAt(0).toUpperCase() + entity.name.slice(1);
  const table = entity.name.toLowerCase() + 's';
  const jsx = [
    '"use client"',
    '',
    'import { useEffect, useState } from "react"',
    `import ${compName}Table from '../components/${compName}Table'`,
    `import ${compName}Form from '../components/${compName}Form'`,
    '',
    `type ${compName} = Record<string, any>`,
    '',
    'export default function Page() {',
    '  const [items, setItems] = useState<'+compName+'[]>([])',
    '  const [loading, setLoading] = useState(true)',
    '  const [error, setError] = useState<string | null>(null)',
    '  const [draft, setDraft] = useState<Record<string, any>>({})',
    '',
    '  useEffect(() => {',
    '    (async () => {',
    '      try {',
    `        const res = await fetch('/api/${table}')`,
    '        if (!res.ok) throw new Error("Failed to load")',
    '        setItems(await res.json())',
    '      } catch (e: any) { setError(e?.message || String(e)) } finally { setLoading(false) }',
    '    })()',
    '  }, [])',
    '',
    '  const onCreate = async (e: any) => {',
    '    e.preventDefault()',
    `    const res = await fetch('/api/${table}', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })`,
    '    if (res.ok) {',
    '      const created = await res.json()',
    '      setItems((prev) => [created, ...prev])',
    '      setDraft({})',
    '    } else { alert("Create failed") }',
    '  }',
    '',
    '  if (loading) return <div className="p-6">Loading…</div>',
    '  if (error) return <div className="p-6 text-red-600">{error}</div>',
    '',
    '  return (',
    '    <div className="p-6 space-y-4">',
    `      <h1 className="text-2xl font-semibold">${compName}</h1>`,
    '      <'+compName+'Form draft={draft} setDraft={setDraft} onSubmit={onCreate} />',
    '      <'+compName+'Table items={items} />',
    '    </div>',
    '  )',
    '}',
  ].join('\n');
  return { path: `app/${entity.name.toLowerCase()}s/page.tsx`, content: jsx };
}

export function generateStripeApiArtifacts(): ArtifactFile[] {
  const checkoutPath = 'app/api/stripe/checkout/route.ts';
  const webhookPath = 'app/api/stripe/webhook/route.ts';

  const checkout = [
    "import Stripe from 'stripe'",
    "import { NextResponse } from 'next/server'",
    '',
    'const requiredEnv = (key: string) => {',
    "  const value = process.env[key]",
    '  if (!value) {',
    "    throw new Error(`Missing environment variable: ${key}`)",
    '  }',
    '  return value;',
    '};',
    '',
    'export async function POST(req: Request) {',
    '  try {',
    '    const secret = requiredEnv("STRIPE_SECRET_KEY");',
    "    const stripe = new Stripe(secret, { apiVersion: '" + STRIPE_API_VERSION + "' })",
    '    const body = await req.json();',
    "    const priceId: string | undefined = body?.priceId ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY",
    '    if (!priceId) {',
    "      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 })",
    '    }',
    "    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'",
    '    const session = await stripe.checkout.sessions.create({',
    "      mode: 'subscription',",
    '      success_url: body?.successUrl ?? `${siteUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,',
    '      cancel_url: body?.cancelUrl ?? `${siteUrl}/pricing`,',
    '      line_items: [{ price: priceId, quantity: 1 }],',
    '      customer_email: body?.customerEmail ?? undefined,',
    '      metadata: {',
    "        user_id: body?.userId ?? '',",
    "        tier: body?.tier ?? 'pro',",
    '        price_id: priceId,',
    '      },',
    '    });',
    '    if (!session.url) {',
    "      return NextResponse.json({ error: 'Unable to create checkout session' }, { status: 500 })",
    '    }',
    '    return NextResponse.json({ url: session.url });',
    '  } catch (err: any) {',
    "    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 })",
    '  }',
    '}',
  ].join('\n');

  const webhook = [
    "import Stripe from 'stripe'",
    "import { NextResponse } from 'next/server'",
    "import { createAdminClient } from '@/lib/supabase/server'",
    '',
    'const getStripe = () => {',
    '  const secret = process.env.STRIPE_SECRET_KEY;',
    '  if (!secret) {',
    "    throw new Error('STRIPE_SECRET_KEY not configured')",
    '  }',
    "  return new Stripe(secret, { apiVersion: '" + STRIPE_API_VERSION + "' })",
    '};',
    '',
    'export async function POST(req: Request) {',
    '  const signature = req.headers.get("stripe-signature");',
    '  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;',
    '  if (!signature || !webhookSecret) {',
    "    return NextResponse.json({ error: 'Webhook signature missing' }, { status: 400 })",
    '  }',
    '',
    '  const payload = await req.text();',
    '  let event: Stripe.Event;',
    '  try {',
    '    event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);',
    '  } catch (err: any) {',
    "    return NextResponse.json({ error: err?.message ?? 'Invalid signature' }, { status: 400 })",
    '  }',
    '',
    '  try {',
    "    if (event.type === 'checkout.session.completed') {",
    "      const session = event.data.object as Stripe.Checkout.Session;",
    '      const supabase = await createAdminClient();',
    '      const updates = {',
    "        stripe_subscription_id: session.subscription ?? '',",
    "        stripe_customer_id: session.customer?.toString() ?? '',",
    "        stripe_price_id: session.metadata?.price_id ?? '',",
    "        status: session.status ?? 'active',",
    "        user_id: session.metadata?.user_id ?? null,",
    '        updated_at: new Date().toISOString(),',
    '      };',
    '      await supabase.from("subscriptions").upsert(updates, { onConflict: "stripe_subscription_id" });',
    '    }',
    '  } catch (err: any) {',
    '    console.error("Stripe webhook error", err);',
    "    return NextResponse.json({ error: err?.message ?? 'Webhook handling failed' }, { status: 500 })",
    '  }',
    '',
    "  return NextResponse.json({ received: true })",
    '}',
  ].join('\n');

  return [
    { path: checkoutPath, content: checkout },
    { path: webhookPath, content: webhook },
  ];
}

export function generateStripeFrontendArtifacts(): ArtifactFile[] {
  const checkoutButtonPath = 'app/pricing/components/CheckoutButton.tsx';
  const pricingPagePath = 'app/pricing/page.tsx';

  const checkoutButton = [
    '"use client"',
    '',
    'import { useState } from "react"',
    '',
    'type Props = { priceId: string; tier: string; period?: string }',
    '',
    'export default function CheckoutButton({ priceId, tier, period = "monthly" }: Props) {',
    '  const [loading, setLoading] = useState(false)',
    '',
    '  const handleClick = async () => {',
    '    try {',
    '      setLoading(true)',
    '      const res = await fetch("/api/stripe/checkout", {',
    '        method: "POST",',
    "        headers: { 'Content-Type': 'application/json' },",
    '        body: JSON.stringify({ priceId, tier, period })',
    '      })',
    '      if (!res.ok) {',
    "        const message = await res.text();",
    '        throw new Error(message || "Failed to create checkout session")',
    '      }',
    '      const { url } = await res.json()',
    '      window.location.href = url',
    '    } catch (err) {',
    '      console.error(err)',
    '      alert("Unable to start checkout. Please try again.")',
    '    } finally {',
    '      setLoading(false)',
    '    }',
    '  }',
    '',
    '  return (',
    '    <button',
    '      onClick={handleClick}',
    '      disabled={loading || !priceId}',
    '      className="w-full rounded-md bg-black px-4 py-2 text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"',
    '    >',
    '      {loading ? "Redirecting…" : `Subscribe ${tier}`}',
    '    </button>',
    '  )',
    '}',
  ].join('\n');

  const pricingPage = [
    'import CheckoutButton from "./components/CheckoutButton"',
    '',
    'const plans = [',
    '  {',
    "    name: 'Pro',",
    "    priceLabel: '$14.99 / month',",
    "    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ?? '',",
    "    features: ['Unlimited projects', 'Client portals', 'Priority support'],",
    '  },',
    '  {',
    "    name: 'Enterprise',",
    "    priceLabel: '$99.99 / month',",
    "    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY ?? '',",
    "    features: ['Everything in Pro', 'Dedicated manager', 'Custom integrations'],",
    '  },',
    '];',
    '',
    'export default function PricingPage() {',
    '  return (',
    '    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16">',
    '      <div className="text-center">',
    '        <h1 className="text-4xl font-bold">Pricing</h1>',
    '        <p className="mt-4 text-muted-foreground">Pick a plan and start building your SaaS in minutes.</p>',
    '      </div>',
    '      <div className="grid gap-6 md:grid-cols-2">',
    '        {plans.map((plan) => (',
    '          <div key={plan.name} className="flex h-full flex-col justify-between rounded-xl border border-border p-6 shadow-sm">',
    '            <div className="space-y-4">',
    '              <h2 className="text-2xl font-semibold">{plan.name}</h2>',
    '              <p className="text-3xl font-bold">{plan.priceLabel}</p>',
    '              <ul className="space-y-2 text-sm text-muted-foreground">',
    '                {plan.features.map((feature) => (',
    '                  <li key={feature}>• {feature}</li>',
    '                ))}',
    '              </ul>',
    '            </div>',
    '            <div className="mt-6">',
    '              <CheckoutButton priceId={plan.priceId} tier={plan.name} />',
    '              {!plan.priceId && (',
    '                <p className="mt-2 text-xs text-red-500">',
    '                  {`Set NEXT_PUBLIC_STRIPE_PRICE_${plan.name.toUpperCase()}_MONTHLY in your environment to enable checkout.`}',
    '                </p>',
    '              )}',
    '            </div>',
    '          </div>',
    '        ))}',
    '      </div>',
    '    </div>',
    '  );',
    '}',
  ].join('\n');

  return [
    { path: checkoutButtonPath, content: checkoutButton },
    { path: pricingPagePath, content: pricingPage },
  ];
}

export function envTemplate(): string {
  return [
    '# Copy these into Vercel project env settings',
    'NEXT_PUBLIC_SUPABASE_URL=',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
    'SUPABASE_SERVICE_ROLE_KEY=',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=',
    'STRIPE_SECRET_KEY=',
    'STRIPE_WEBHOOK_SECRET=',
    'NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=',
    'NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=',
    'NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY=',
    'NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_YEARLY=',
    '',
    '# Optional app name',
    'NEXT_PUBLIC_APP_NAME=',
  ].join('\n');
}

export function generateTypes(entities: Entity[], relationships: Relationship[]): ArtifactFile {
  const relMap: Record<string, string[]> = {};
  for (const r of relationships) {
    if (r.type === 'many-to-one') {
      const from = r.from.toLowerCase();
      const to = r.to.toLowerCase();
      relMap[from] = relMap[from] || [];
      relMap[from].push(`${to}_id`);
    }
  }
  const lines: string[] = [];
  lines.push('// Agentic generated types');
  for (const e of entities) {
    const name = e.name.charAt(0).toUpperCase() + e.name.slice(1);
    const tname = `${name}`;
    const relFields = (relMap[e.name.toLowerCase()] || [])
      .map((f) => `  ${f}?: string;`)
      .join('\n');
    lines.push(`export interface ${tname} {`);
    lines.push('  id: string;');
    lines.push('  user_id?: string;');
    lines.push('  created_at: string;');
    lines.push('  updated_at: string;');
    if (e.attributes) {
      for (const [attr, type] of Object.entries(e.attributes)) {
        lines.push(`  ${attr}?: ${tsTypeFrom(type)};`);
      }
    }
    if (relFields) lines.push(relFields);
    lines.push('}');
    lines.push('');
  }
  return { path: 'types/generated-agentic.ts', content: lines.join('\n') };
}

export function generateBaseline(entities: Entity[], relationships: Relationship[], operations: Operation[]): ArtifactFile[] {
  const artifacts: ArtifactFile[] = [];
  artifacts.push(generateMigration(entities, relationships));
  artifacts.push(generateTypes(entities, relationships));
  for (const op of operations) artifacts.push(generateApiRoute(op));
  if (entities[0]) artifacts.push(generateReactPage(entities[0]));
  return artifacts;
}

export const Template = { compile };
