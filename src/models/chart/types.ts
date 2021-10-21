import { Node, Connection } from '@cognite/connect';

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
  sourceCollection?: SourceCollectionData[];
  dateFrom: string;
  dateTo: string;
  public?: boolean;
  dirty?: boolean;
  settings?: ChartSettings;
};

export type SourceCollectionData = {
  type: string;
  id: string;
};

type ChartSettings = {
  showYAxis?: boolean;
  showMinMax?: boolean;
  showGridlines?: boolean;
  mergeUnits?: boolean;
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
  statisticsCalls?: StatisticsCallRef[];
  createdAt: number;
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
  calls?: CalculationCallRef[];
  statisticsCalls?: StatisticsCallRef[];
  createdAt?: number;
  attachTo?: string;
};

export type StorableNode = Omit<Node, 'functionEffect'> & {
  functionEffectReference?: string;
};

export type CalculationCallRef = {
  callId: string;
  callDate: number;
  hash?: number;
  computation?: string;
};

export type StatisticsCallRef = {
  callId: string;
  callDate: number;
  hash?: number;
};

export type UserInfo = {
  id: string;
  email?: string;
  displayName?: string;
};
