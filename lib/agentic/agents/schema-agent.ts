import { AgentInput, AgentOutput, SubAgent } from '../types';
import { generateMigration, generateTypes } from '../templates';

export class SchemaAgent implements SubAgent {
  id = 'schema-agent';

  async run(input: AgentInput): Promise<AgentOutput> {
    try {
      const migration = generateMigration(input.intent.entities, input.intent.relationships);
      const types = generateTypes(input.intent.entities, input.intent.relationships);
      return {
        status: 'ok',
        artifacts: [migration, types],
        logs: [
          'SchemaAgent: migration generated',
          'SchemaAgent: types generated',
        ],
      };
    } catch (e: any) {
      return { status: 'error', artifacts: [], error: e?.message ?? 'Unknown error' };
    }
  }
}

export default SchemaAgent;
