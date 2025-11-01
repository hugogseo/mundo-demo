import { AgentInput, AgentOutput, SubAgent } from '../types';
import { generateReactPage } from '../templates';

export class FrontendAgent implements SubAgent {
  id = 'frontend-agent';

  async run(input: AgentInput): Promise<AgentOutput> {
    try {
      const artifacts = input.intent.entities.map((e) => generateReactPage(e));
      if (artifacts.length === 0) {
        // generate a default page
        artifacts.push(generateReactPage({ name: 'Record' }));
      }
      return { status: 'ok', artifacts, logs: [`FrontendAgent: ${artifacts.length} pages generated`] };
    } catch (e: any) {
      return { status: 'error', artifacts: [], error: e?.message ?? 'Unknown error' };
    }
  }
}

export default FrontendAgent;
