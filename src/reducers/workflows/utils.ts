import { getNodeOutput, NodeProgress, Node } from '@cognite/connect';
import { LatestWorkflowRun, NodeOption, StorableNode, Workflow } from './types';
import nodeOptions from './Nodes';

export const convertStoredNodeToNode = (
  node: StorableNode,
  options: NodeOption[]
): Node => {
  const { functionEffectReference } = node;
  const functionEffect = options.find(
    (opt) => opt.effectId === functionEffectReference
  )?.effect;
  if (functionEffect) {
    return {
      ...node,
      functionEffect,
    };
  }
  return node;
};

export const runWorkflow = async (
  workflow: Workflow,
  onProgressUpdate: (nextProgress: Partial<NodeProgress>) => void
): Promise<LatestWorkflowRun> => {
  // In order to run our stored workflow, we need to go into each node
  // and replace its `functionEffectType` with its actual `functionEffect`.
  const runnableNodes = workflow.nodes.map((node) =>
    convertStoredNodeToNode(node, nodeOptions)
  );
  // Right now we support a single output node.
  // In the future we could update this to support more
  const outputNode = runnableNodes.find(
    (node) => !node.outputPins || node.outputPins.length === 0
  );
  if (!outputNode) {
    // If we have no output node, we cannot run
    return {
      status: 'FAILED',
      timestamp: Date.now(),
      errors: ['There must be an output node in the workflow.'],
    };
  }
  try {
    const workflowResult = await getNodeOutput(
      outputNode,
      runnableNodes.reduce((acc, a) => ({ ...acc, [a.id]: a }), {}),
      workflow.connections,
      onProgressUpdate
    );
    return {
      status: 'SUCCESS',
      timestamp: Date.now(),
      results: workflowResult,
    };
  } catch (e) {
    return {
      status: 'FAILED',
      timestamp: Date.now(),
      errors: [e],
    };
  }
};
