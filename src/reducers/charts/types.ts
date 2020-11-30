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
  color: string;
  enabled: boolean;
};

export type ChartWorkflow = {
  id: string;
  color: string;
  enabled: boolean;
};
