import { Node, Connection } from '@cognite/connect';
import { FunctionComponent } from 'react';

export type Chart = {
  version: number;
  id: string;
  name: string;
  user: string;
  userInfo?: UserInfo;
  // could be undefined for old charts
  createdAt: number;
  updatedAt: number;
  timeSeriesCollection?: ChartTimeSeries[];
  workflowCollection?: ChartWorkflow[];
  dateFrom: string;
  dateTo: string;
  selectedDateRange?: string;
  public?: boolean;
  dirty?: boolean;
};

export type ChartTimeSeries = {
  type?: string;
  id: string;
  name: string;
  color: string;
  tsId: number;
  tsExternalId?: string;
  lineWeight?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  displayMode?: 'lines' | 'markers';
  enabled: boolean;
  unit?: string;
  originalUnit?: string;
  preferredUnit?: string;
  description?: string;
  range?: number[];
  statisticsCalls?: Call[];
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
  hash?: number;
};

export type ChartWorkflow = {
  type?: string;
  id: string;
  name: string;
  lineWeight?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  displayMode?: 'lines' | 'markers';
  unit?: string;
  preferredUnit?: string;
  color: string;
  enabled: boolean;
  range?: number[];
  nodes?: StorableNode[]; // We don't need these functions until we 'compile'/run the workflow.
  connections?: Record<string, Connection>;
  calls?: Call[];
  statisticsCalls?: Call[];
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
  disabled?: boolean;

  // Some nodes (e.g. output nodes) won't have an effect or data
  effect?: (funcData: object, ...inputPinValues: any[]) => Record<string, any>; // out = Output pin values
  effectId?: string;

  ConfigPanel?: ConfigPanelComponent;
};

export type UserInfo = {
  id: string;
  email?: string;
  displayName?: string;
};
