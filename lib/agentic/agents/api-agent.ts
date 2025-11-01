import { AgentInput, AgentOutput, SubAgent } from '../types';
import { generateApiRoute, generateCrudRoutes } from '../templates';

export class ApiAgent implements SubAgent {
  id = 'api-agent';

  async run(input: AgentInput): Promise<AgentOutput> {
    try {
      const opRoutes = input.intent.operations.map((op) => generateApiRoute(op));
      const crudRoutes = input.intent.entities.flatMap((e) => generateCrudRoutes(e));
      const artifacts = [...opRoutes, ...crudRoutes];
      return { status: 'ok', artifacts, logs: [`ApiAgent: ${artifacts.length} routes generated (${opRoutes.length} ops, ${crudRoutes.length} CRUD)`] };
    } catch (e: any) {
      return { status: 'error', artifacts: [], error: e?.message ?? 'Unknown error' };
    }
  }
}

export default ApiAgent;
