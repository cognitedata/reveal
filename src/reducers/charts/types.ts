import { Node, Connection, NodeProgress } from '@cognite/connect';
import { FunctionComponent } from 'react';

export type Chart = {
  id: string;
  name: string;
  user: string;
  timeSeriesCollection?: ChartTimeSeries[];
  workflowCollection?: ChartWorkflow[];
  millisecondsFromNow?: number;
  dateFrom: string;
  dateTo: string;
  visibleRange?: any[];
  public?: boolean;
};

export type ChartTimeSeries = {
  id: string;
  name: string;
  color: string;
  lineWeight?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  enabled: boolean;
  unit?: string;
  originalUnit?: string;
  preferredUnit?: string;
  description?: string;
  range?: number[];
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

export type ChartWorkflow = {
  id: string;
  name: string;
  lineWeight?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  color: string;
  enabled: boolean;
  range?: number[];
  nodes?: StorableNode[]; // We don't need these functions until we 'compile'/run the workflow.
  connections?: Record<string, Connection>;
  // Latest run of this workflow (not to be stored)
  latestRun?: LatestWorkflowRun;
};

export type ConfigPanelComponentProps = {
  node: StorableNode;
  onUpdateNode: (nextNode: StorableNode) => void;
  context: any;
};

export type ConfigPanelComponent = FunctionComponent<ConfigPanelComponentProps>;

export type NodeOption = {
  name: string; // Outward name when selecting the node
  node: StorableNode; // The STORABLE node (without its function effect)

  // Some nodes (e.g. output nodes) won't have an effect or data
  effect?: (funcData: object, ...inputPinValues: any[]) => Record<string, any>; // out = Output pin values
  effectId?: string;

  configPanel?: ConfigPanelComponent;
};
