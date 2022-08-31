import PlotlyChart from 'components/PlotlyChart/PlotlyChart';
import { Chart } from 'models/chart/types';
import { ComponentProps } from 'react';

export type ChartItem = {
  id: string;
  name: string;
  owner: string;
  /** Date in ISO format */
  updatedAt: string;
  /** Firebase Chart mainly for chart duplication */
  firebaseChart: Chart;
  loadingPlot: boolean;
  plotlyProps: ComponentProps<typeof PlotlyChart> | undefined;
};
