import { Node, Connection, NodeProgress } from '@cognite/connect';
import { FunctionComponent } from 'react';

type ConfigPanelComponent = FunctionComponent<{
  data: object;
  onUpdate: (nextData: object) => void;
}>;

export type NodeOption = {
  name: string; // Outward name when selecting the node
  node: StorableNode; // The STORABLE node (without its function effect)

  // Some nodes (e.g. output nodes) won't have an effect or data
  effect?: (funcData: object, ...inputPinValues: any[]) => Record<string, any>; // out = Output pin values
  effectId?: string;

  configPanel?: ConfigPanelComponent;
};

// We can't store function definitions, so we need to work around this.
export type StorableNode = Omit<Node, 'functionEffect'> & {
  functionEffectReference?: string;
};

export type WorkflowRunStatus = 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED';

export type LatestWorkflowRun = {
  timestamp: number;
  nodeProgress?: NodeProgress;
  status: WorkflowRunStatus;
  results?: Record<string, any>;
  errors?: string[];
};

export type Workflow = {
  // Core data
  id: string;
  name: string;
  nodes: StorableNode[]; // We don't need these functions until we 'compile'/run the workflow.
  connections: Record<string, Connection>;

  // Latest run of this workflow (not to be stored)
  latestRun?: LatestWorkflowRun;
};
