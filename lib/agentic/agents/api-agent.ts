import { AgentInput, AgentOutput, SubAgent } from '../types';
import { generateApiRoute } from '../templates';

export class ApiAgent implements SubAgent {
  id = 'api-agent';

  async run(input: AgentInput): Promise<AgentOutput> {
    try {
      const artifacts = input.intent.operations.map((op) => generateApiRoute(op));
      return { status: 'ok', artifacts, logs: [`ApiAgent: ${artifacts.length} routes generated`] };
    } catch (e: any) {
      return { status: 'error', artifacts: [], error: e?.message ?? 'Unknown error' };
    }
  }
}

export default ApiAgent;
