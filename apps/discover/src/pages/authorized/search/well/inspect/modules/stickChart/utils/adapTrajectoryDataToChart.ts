import { adaptToTrajectoryChartDataList } from 'domain/wells/trajectory/internal/transformers/adaptToTrajectoryChartDataList';
import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';

import head from 'lodash/head';
import { PlotData } from 'plotly.js';

import { ProjectConfigWellsTrajectoryCharts } from '@cognite/discover-api-types';

export const adapTrajectoryDataToChart = (
  data: TrajectoryWithData,
  curveColor: string,
  chartConfig?: ProjectConfigWellsTrajectoryCharts
): Partial<PlotData>[] => {
  if (!chartConfig) {
    return [];
  }

  const { data: chartData } = adaptToTrajectoryChartDataList(
    [data],
    [chartConfig],
    () => ({
      name: '',
      line: {
        color: curveColor,
      },
    })
  );

  return head(chartData) || [];
};
