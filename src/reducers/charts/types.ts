import { Node, Connection } from '@cognite/connect';
import { FunctionComponent } from 'react';

export type Chart = {
  id: string;
  name: string;
  user: string;
  timeSeriesCollection?: ChartTimeSeries[];
  workflowCollection?: ChartWorkflow[];
  dateFrom: string;
  dateTo: string;
  public?: boolean;
};

export type ChartTimeSeries = {
  id: string;
  name: string;
  color: string;
  tsId: number;
  tsExternalId?: string;
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

export type FunctionCallStatus = 'Running' | 'Completed' | 'Failed' | 'Timeout';

export type Call = {
  functionId: number;
  callId: number;
  // Call date is also available from the function api but this allows us to sort chronologically
  // based on firebase data
  callDate: number;
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
  calls?: Call[];
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
