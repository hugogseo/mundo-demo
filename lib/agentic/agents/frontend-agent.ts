import { AgentInput, AgentOutput, SubAgent } from '../types';
import {
  generateReactPage,
  generateEntityFormComponent,
  generateEntityTableComponent,
  generateStripeFrontendArtifacts,
} from '../templates';

export class FrontendAgent implements SubAgent {
  id = 'frontend-agent';

  async run(input: AgentInput): Promise<AgentOutput> {
    try {
      const artifacts = input.intent.entities.flatMap((e) => [
        generateEntityFormComponent(e),
        generateEntityTableComponent(e),
        generateReactPage(e),
      ]);
      const mentionsPayment =
        input.intent.entities.some((e) => e.name.toLowerCase().includes('payment')) ||
        input.intent.operations.some((o) => (o.name || '').toLowerCase().includes('payment'));

      if (mentionsPayment) {
        const stripeArtifacts = generateStripeFrontendArtifacts();
        artifacts.push(...stripeArtifacts);
      }

      if (artifacts.length === 0) {
        // generate a default page
        artifacts.push(...[
          generateEntityFormComponent({ name: 'Record' }),
          generateEntityTableComponent({ name: 'Record' }),
          generateReactPage({ name: 'Record' }),
        ]);
      }
      return { status: 'ok', artifacts, logs: [`FrontendAgent: ${artifacts.length} UI artifacts generated`] };
    } catch (e: any) {
      return { status: 'error', artifacts: [], error: e?.message ?? 'Unknown error' };
    }
  }
}

export default FrontendAgent;
