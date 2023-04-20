import { Connection } from 'reactflow';

import { WorkflowBuilderNode } from 'types';

export const isConnectionValid = (_: Connection, __: WorkflowBuilderNode[]) => {
  return true;
};
