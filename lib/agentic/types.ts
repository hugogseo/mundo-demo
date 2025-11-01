export type RelationshipType = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';

export type Entity = {
  name: string;
  attributes?: Record<string, string>;
};

export type Relationship = {
  from: string;
  to: string;
  type: RelationshipType;
};

export type Operation = {
  name: string;
  entity?: string;
  action?: string;
};

export interface Intent {
  raw: string;
  entities: Entity[];
  relationships: Relationship[];
  operations: Operation[];
  questions: string[];
}

export type ArtifactFile = {
  path: string;
  content: string;
};

export interface AgentContext {
  scopedPaths: string[];
  cache?: Record<string, unknown>;
  checkpointId?: string;
}

export interface AgentInput {
  intent: Intent;
  context: AgentContext;
}

export interface AgentOutput {
  status: 'ok' | 'error';
  artifacts: ArtifactFile[];
  logs?: string[];
  error?: string;
}

export interface SubAgent {
  id: string;
  run(input: AgentInput): Promise<AgentOutput>;
}
