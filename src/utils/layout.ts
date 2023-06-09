import Elk from 'elkjs/lib/elk.bundled';

import { WorkflowExecutionDetails } from 'hooks/workflows';

type ElkNode = {
  id: string;
  width: number;
  height: number;
};

type ElkEdge = {
  id: string;
  sources: string[];
  targets: string[];
};

const NODE_WIDTH = 350;
const NODE_HEIGHT = 110;

export const computeLayout = async (execution: WorkflowExecutionDetails) => {
  const elk = new Elk();

  const nodes: ElkNode[] = [];
  const edges: ElkEdge[] = [];

  execution.workflowDefinition?.tasks.forEach(({ externalId, dependsOn }) => {
    nodes.push({
      id: externalId,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });

    dependsOn.forEach(({ externalId: parentTaskExternalId }) => {
      edges.push({
        id: `${parentTaskExternalId} - ${externalId}`,
        sources: [parentTaskExternalId],
        targets: [externalId],
      });
    });
  });

  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
    },
    children: nodes,
    edges,
  };

  return elk.layout(graph);
};
