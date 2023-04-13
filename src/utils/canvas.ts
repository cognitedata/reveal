import { CanvasBlockType } from 'components/canvas-block';
import { CustomNodeData } from 'components/custom-node';
import { Connection, Node } from 'reactflow';

const COMPABILITY_MATRIX: Record<CanvasBlockType, CanvasBlockType[]> = {
  'data-set': ['entity-matching', 'extraction-pipeline', 'transformation'],
  'engineering-diagram': ['data-set'],
  'entity-matching': ['data-set'],
  'extraction-pipeline': ['data-set'],
  'raw-table': ['data-set', 'transformation'],
  transformation: ['data-set'],
};

export const isConnectionValid = (
  connection: Connection,
  nodes: Node<CustomNodeData>[]
) => {
  const { source: sourceId, target: targetId } = connection;
  const sourceNode = nodes.find(({ id }) => id === sourceId);
  const targetNode = nodes.find(({ id }) => id === targetId);

  return (
    !!sourceNode &&
    !!targetNode &&
    (COMPABILITY_MATRIX[sourceNode.data.type].includes(targetNode.data.type) ||
      COMPABILITY_MATRIX[targetNode.data.type].includes(sourceNode.data.type))
  );
};
