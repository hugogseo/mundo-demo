import { AgentInput, AgentOutput, SubAgent } from '../types';
import { generateMigration } from '../templates';

export class SchemaAgent implements SubAgent {
  id = 'schema-agent';

  async run(input: AgentInput): Promise<AgentOutput> {
    try {
      const artifact = generateMigration(input.intent.entities, input.intent.relationships);
      return { status: 'ok', artifacts: [artifact], logs: ['SchemaAgent: migration generated'] };
    } catch (e: any) {
      return { status: 'error', artifacts: [], error: e?.message ?? 'Unknown error' };
    }
  }
}

export default SchemaAgent;
