import isEqual from 'lodash/isEqual';

import { ProjectConfigWellsTrajectoryCharts } from '@cognite/discover-api-types';

import { TrajectoryChartDataAccessor, TrajectoryChartPlane } from '../types';

export const findChartConfigByAccessors = (
  chartConfigs: ProjectConfigWellsTrajectoryCharts[],
  accessors: Partial<Record<TrajectoryChartPlane, TrajectoryChartDataAccessor>>
) => {
  return chartConfigs.find(({ chartData }) => isEqual(chartData, accessors));
};
