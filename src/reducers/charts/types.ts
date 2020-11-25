export type Chart = {
  id: string;
  name: string;
  user: string;
  timeSeriesCollection?: ChartTimeSeries[];
  workflowIds?: string[];
  dateFrom: string;
  dateTo: string;
};

export type ChartTimeSeries = {
  id: string;
  color: string;
  enabled: boolean;
};
