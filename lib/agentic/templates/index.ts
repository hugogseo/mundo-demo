import { Entity, Relationship, Operation, ArtifactFile } from '../types';

function compile(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => String(vars[k] ?? ''));
}

export function generateMigration(entities: Entity[], relationships: Relationship[]): ArtifactFile {
  const lines: string[] = [];
  lines.push('BEGIN;');
  for (const e of entities) {
    const table = e.name.toLowerCase() + 's';
    lines.push(`CREATE TABLE IF NOT EXISTS public.${table} (id uuid PRIMARY KEY DEFAULT gen_random_uuid());`);
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

export function generateReactPage(entity: Entity): ArtifactFile {
  const compName = entity.name.charAt(0).toUpperCase() + entity.name.slice(1);
  const jsx = [
    "export default function Page() {",
    `  return (<div className=\"p-6\"><h1 className=\"text-2xl font-semibold\">${compName}</h1></div>)`,
    '}',
  ].join('\n');
  return { path: `app/${entity.name.toLowerCase()}s/page.tsx`, content: jsx };
}

export function generateBaseline(entities: Entity[], relationships: Relationship[], operations: Operation[]): ArtifactFile[] {
  const artifacts: ArtifactFile[] = [];
  artifacts.push(generateMigration(entities, relationships));
  for (const op of operations) artifacts.push(generateApiRoute(op));
  if (entities[0]) artifacts.push(generateReactPage(entities[0]));
  return artifacts;
}

export const Template = { compile };
