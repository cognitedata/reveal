import { Connection } from 'reactflow';

import { WorkflowBuilderNode } from '@flows/types';

export const isConnectionValid = (_: Connection, __: WorkflowBuilderNode[]) => {
  return true;
};
