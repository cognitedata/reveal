import { ProjectConfigWellsTrajectoryCharts } from '@cognite/discover-api-types';

import { useDeepMemo } from 'hooks/useDeep';

import { TrajectoryChartDataAccessor, TrajectoryChartPlane } from '../types';
import { findChartConfigByAccessors } from '../utils/findChartConfigByAccessors';

import { useTrajectoryChartsConfig } from './useTrajectoryChartsConfig';

/**
 * This hook helps to get the chart config by passing the accessors.
 *
 * @example
 * useTrajectoryChartConfigByAccessors({ x: 'ed', y: 'tvd' })
 * returns the chart config which the x-accessor is 'ed' and y-accessor is 'tvd'.
 */
export const useTrajectoryChartConfigByAccessors = (
  accessors: Partial<Record<TrajectoryChartPlane, TrajectoryChartDataAccessor>>
): ProjectConfigWellsTrajectoryCharts | undefined => {
  const chartConfigs = useTrajectoryChartsConfig();

  return useDeepMemo(
    () => findChartConfigByAccessors(chartConfigs, accessors),
    [chartConfigs, accessors]
  );
};
