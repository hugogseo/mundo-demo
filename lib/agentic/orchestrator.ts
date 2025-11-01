import parseIntent from './intent-parser';
import { createContext, mergeArtifacts, checkpoint } from './context';
import { AgentContext, AgentOutput, ArtifactFile } from './types';
import { SchemaAgent } from './agents/schema-agent';
import { ApiAgent } from './agents/api-agent';
import { FrontendAgent } from './agents/frontend-agent';
import { DeploymentAgent } from './agents/deployment-agent';
import { generateStripeCheckoutExamples } from './templates';

export type OrchestrateOptions = {
  scopedPaths?: string[];
  withDeployment?: boolean;
};

export type OrchestrateResult = {
  artifacts: ArtifactFile[];
  logs: string[];
  context: AgentContext;
  outputs: Record<string, AgentOutput>;
};

export async function orchestrate(description: string, options: OrchestrateOptions = {}): Promise<OrchestrateResult> {
  const intent = parseIntent(description);
  const context = createContext(options.scopedPaths ?? ['app', 'lib', 'supabase']);

  const schemaAgent = new SchemaAgent();
  const apiAgent = new ApiAgent();
  const frontendAgent = new FrontendAgent();
  const deploymentAgent = new DeploymentAgent();

  const baseInput = { intent, context };

  const [schemaOut, apiOut, feOut] = await Promise.all([
    schemaAgent.run(baseInput),
    apiAgent.run(baseInput),
    frontendAgent.run(baseInput),
  ]);

  const outputs: Record<string, AgentOutput> = {
    [schemaAgent.id]: schemaOut,
    [apiAgent.id]: apiOut,
    [frontendAgent.id]: feOut,
  };

  const artifacts = mergeArtifacts(
    schemaOut.artifacts,
    apiOut.artifacts,
    feOut.artifacts,
  );

  let logs: string[] = [];
  logs = logs.concat(schemaOut.logs ?? [], apiOut.logs ?? [], feOut.logs ?? []);

  // Stripe examples if intent includes payments
  const mentionsPayment =
    intent.entities.some((e) => e.name.toLowerCase().includes('payment')) ||
    intent.operations.some((o) => (o.name || '').toLowerCase().includes('payment'));
  if (mentionsPayment) {
    const stripeArtifacts = generateStripeCheckoutExamples();
    stripeArtifacts.forEach((a) => artifacts.push(a));
    logs.push('Orchestrator: Stripe checkout examples added');
  }

  let ctx = checkpoint(context, outputs);

  if (options.withDeployment) {
    const deployOut = await deploymentAgent.run({ intent, context: ctx });
    outputs[deploymentAgent.id] = deployOut;
    logs = logs.concat(deployOut.logs ?? []);
  }

  return { artifacts, logs, context: ctx, outputs };
}

export default orchestrate;
