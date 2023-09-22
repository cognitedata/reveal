import { Chart } from '@cognite/charts-lib';

export type ChartItem = {
  id: string;
  name: string;
  owner: string;
  /** Date in ISO format */
  updatedAt: string;
  /** Firebase Chart mainly for chart duplication */
  firebaseChart: Chart;
};
