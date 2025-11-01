import { AgentInput, AgentOutput, SubAgent } from '../types';
import { generateApiRoute, generateCrudRoutes, generateStripeApiArtifacts } from '../templates';

export class ApiAgent implements SubAgent {
  id = 'api-agent';

  async run(input: AgentInput): Promise<AgentOutput> {
    try {
      const opRoutes = input.intent.operations.map((op) => generateApiRoute(op));
      const crudRoutes = input.intent.entities.flatMap((e) => generateCrudRoutes(e));
      const mentionsPayment =
        input.intent.entities.some((e) => e.name.toLowerCase().includes('payment')) ||
        input.intent.operations.some((o) => (o.name || '').toLowerCase().includes('payment'));

      const artifacts = [...opRoutes, ...crudRoutes];
      let logs = [`ApiAgent: ${artifacts.length} routes generated (${opRoutes.length} ops, ${crudRoutes.length} CRUD)`];

      if (mentionsPayment) {
        const stripeArtifacts = generateStripeApiArtifacts();
        artifacts.push(...stripeArtifacts);
        logs.push(`ApiAgent: Stripe artifacts added (${stripeArtifacts.length} files)`);
      }

      return { status: 'ok', artifacts, logs };
    } catch (e: any) {
      return { status: 'error', artifacts: [], error: e?.message ?? 'Unknown error' };
    }
  }
}

export default ApiAgent;
