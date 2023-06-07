import { Chart } from '@charts-app/models/chart/types';

export type ChartItem = {
  id: string;
  name: string;
  owner: string;
  /** Date in ISO format */
  updatedAt: string;
  /** Firebase Chart mainly for chart duplication */
  firebaseChart: Chart;
};
