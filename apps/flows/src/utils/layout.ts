import { WorkflowExecution } from '@flows/types/workflows';
import Elk from 'elkjs/lib/elk.bundled';

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

export const computeLayout = async (execution: WorkflowExecution) => {
  const elk = new Elk();

  const nodes: ElkNode[] = [];
  const edges: ElkEdge[] = [];

  execution.workflowDefinition?.tasks.forEach(({ externalId, dependsOn }) => {
    nodes.push({
      id: externalId,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });

    dependsOn?.forEach(({ externalId: parentTaskExternalId }) => {
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
