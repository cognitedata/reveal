import { Connection, Node } from 'reactflow';

import { CustomNodeData } from 'components/custom-node';

export const isConnectionValid = (
  _: Connection,
  __: Node<CustomNodeData>[]
) => {
  return true;
};
