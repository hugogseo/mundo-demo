import { Intent, Entity, Relationship, Operation } from './types';

const KEYWORDS: Record<string, { entities: string[]; operations: string[] }> = {
  invoice: { entities: ['Invoice', 'Client', 'Payment'], operations: ['CreateInvoice', 'SendInvoice', 'CollectPayment'] },
  invoices: { entities: ['Invoice', 'Client', 'Payment'], operations: ['CreateInvoice', 'SendInvoice', 'CollectPayment'] },
  client: { entities: ['Client'], operations: ['CreateClient', 'UpdateClient'] },
  clients: { entities: ['Client'], operations: ['CreateClient', 'UpdateClient'] },
  project: { entities: ['Project', 'Task'], operations: ['CreateProject', 'CreateTask'] },
  projects: { entities: ['Project', 'Task'], operations: ['CreateProject', 'CreateTask'] },
  task: { entities: ['Task'], operations: ['CreateTask', 'AssignTask', 'CompleteTask'] },
  tasks: { entities: ['Task'], operations: ['CreateTask', 'AssignTask', 'CompleteTask'] },
  team: { entities: ['Team', 'User'], operations: ['InviteUser', 'AssignRole'] },
  teams: { entities: ['Team', 'User'], operations: ['InviteUser', 'AssignRole'] },
  payment: { entities: ['Payment'], operations: ['CollectPayment', 'RefundPayment'] },
  payments: { entities: ['Payment'], operations: ['CollectPayment', 'RefundPayment'] },
};

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function parseIntent(raw: string): Intent {
  const lower = raw.toLowerCase();

  const foundEntities = new Array<string>();
  const foundOperations = new Array<string>();

  for (const [kw, data] of Object.entries(KEYWORDS)) {
    if (lower.includes(kw)) {
      foundEntities.push(...data.entities);
      foundOperations.push(...data.operations);
    }
  }

  // Default entity if nothing matched
  const entities: Entity[] = unique(foundEntities.length ? foundEntities : ['Record']).map((name) => ({ name }));

  // Naive relationships: if both Invoice and Client exist, link them; Project -> Task, User -> Team
  const relationships: Relationship[] = [];
  const has = (name: string) => entities.some((e) => e.name === name);
  if (has('Invoice') && has('Client')) relationships.push({ from: 'Invoice', to: 'Client', type: 'many-to-one' });
  if (has('Project') && has('Task')) relationships.push({ from: 'Task', to: 'Project', type: 'many-to-one' });
  if (has('User') && has('Team')) relationships.push({ from: 'User', to: 'Team', type: 'many-to-many' });

  const operations: Operation[] = unique(foundOperations.length ? foundOperations : ['CreateRecord']).map((name) => ({ name }));

  const questions: string[] = [];
  if (has('Payment')) {
    questions.push('Should customers pay as guests or require accounts? (guest/accounts)');
    questions.push('Do you need recurring billing? (yes/no)');
  }
  if (has('Team')) {
    questions.push('Do teams need role-based permissions? (yes/no)');
  }

  return {
    raw,
    entities,
    relationships,
    operations,
    questions,
  };
}

export default parseIntent;
