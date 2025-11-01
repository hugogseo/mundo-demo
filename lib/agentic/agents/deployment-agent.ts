import { AgentInput, AgentOutput, SubAgent } from '../types';

export class DeploymentAgent implements SubAgent {
  id = 'deployment-agent';

  async run(input: AgentInput): Promise<AgentOutput> {
    try {
      // Foundation stub: no-op deployment; later phases will implement Vercel/Supabase automation
      const notes = [
        'DeploymentAgent: stub execution',
        'Next phases: provision Vercel project, set env vars, run migrations',
      ];
      return { status: 'ok', artifacts: [], logs: notes };
    } catch (e: any) {
      return { status: 'error', artifacts: [], error: e?.message ?? 'Unknown error' };
    }
  }
}

export default DeploymentAgent;
