export type Chart = {
  id: string;
  name: string;
  user: string;
  timeSeriesCollection?: ChartTimeSeries[];
  workflowCollection?: ChartWorkflow[];
  dateFrom: string;
  dateTo: string;
  visibleRange?: any[];
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

export type ChartWorkflow = {
  id: string;
  name: string;
  lineWeight?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  color: string;
  enabled: boolean;
  range?: number[];
};
