import fs from 'fs';
import path from 'path';
import type { ArtifactFile } from './types';

export type WriteAction = 'create' | 'overwrite' | 'skip';

export interface WritePlanItem {
  artifact: ArtifactFile;
  action: WriteAction;
  reason?: string;
}

export function planWrites(artifacts: ArtifactFile[], { overwrite = false } = {}): WritePlanItem[] {
  return artifacts.map((a) => {
    const abs = path.resolve(process.cwd(), a.path);
    const exists = fs.existsSync(abs);
    if (!exists) return { artifact: a, action: 'create' };
    if (overwrite) return { artifact: a, action: 'overwrite', reason: 'File exists but overwrite enabled' };
    return { artifact: a, action: 'skip', reason: 'File exists; overwrite disabled' };
  });
}

export function applyWritePlan(plan: WritePlanItem[]): { created: number; overwritten: number; skipped: number } {
  let created = 0, overwritten = 0, skipped = 0;
  for (const item of plan) {
    const abs = path.resolve(process.cwd(), item.artifact.path);
    const dir = path.dirname(abs);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (item.action === 'create') {
      fs.writeFileSync(abs, item.artifact.content, 'utf8');
      created++;
    } else if (item.action === 'overwrite') {
      fs.writeFileSync(abs, item.artifact.content, 'utf8');
      overwritten++;
    } else {
      skipped++;
    }
  }
  return { created, overwritten, skipped };
}

export function preview(plan: WritePlanItem[]): string {
  const lines: string[] = [];
  for (const item of plan) {
    lines.push(`${item.action.toUpperCase()}: ${item.artifact.path}${item.reason ? `  # ${item.reason}` : ''}`);
  }
  return lines.join('\n');
}
