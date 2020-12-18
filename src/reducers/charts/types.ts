export type Chart = {
  id: string;
  name: string;
  user: string;
  timeSeriesCollection?: ChartTimeSeries[];
  workflowCollection?: ChartWorkflow[];
  dateFrom: string;
  dateTo: string;
};

export type ChartTimeSeries = {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  unit?: string;
  description?: string;
};

export type ChartWorkflow = {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
};
