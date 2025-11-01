import { AgentContext, AgentOutput, ArtifactFile } from './types';

export function createContext(scopedPaths: string[], cache: Record<string, unknown> = {}): AgentContext {
  return { scopedPaths, cache };
}

export function checkpoint(context: AgentContext, outputs: Record<string, AgentOutput>): AgentContext {
  const id = `cp_${Date.now()}`;
  const nextCache = { ...(context.cache || {}), [`checkpoint:${id}`]: outputs };
  return { ...context, cache: nextCache, checkpointId: id };
}

export function restore(context: AgentContext, checkpointId: string): Record<string, AgentOutput> | undefined {
  const cache = context.cache || {};
  const key = `checkpoint:${checkpointId}`;
  return cache[key] as Record<string, AgentOutput> | undefined;
}

export function mergeArtifacts(...groups: ArtifactFile[][]): ArtifactFile[] {
  const map = new Map<string, ArtifactFile>();
  for (const group of groups) {
    for (const file of group) {
      map.set(file.path, file);
    }
  }
  return Array.from(map.values());
}
