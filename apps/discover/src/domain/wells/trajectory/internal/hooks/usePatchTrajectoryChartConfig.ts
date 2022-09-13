import get from 'lodash/get';

import { ProjectConfigWellsTrajectoryCharts } from '@cognite/discover-api-types';

import { useDeepMemo } from 'hooks/useDeep';

import { TrajectoryChartPlane, TrajectoryChartDataAccessor } from '../types';

import { useTrajectoryChartConfigByAccessors } from './useTrajectoryChartConfigByAccessors';

/**
 * This hook is useful when we need to override some original config.
 * The `customConfig` will take place instead of the original config values.
 *
 * @example
 * We can get the original config for `tvd` vs `ed` and then,
 * form `md` vs `ed` config using that.
 */
export const usePatchTrajectoryChartConfig = (
  accessors: Partial<Record<TrajectoryChartPlane, TrajectoryChartDataAccessor>>,
  customConfig: Partial<ProjectConfigWellsTrajectoryCharts>
): ProjectConfigWellsTrajectoryCharts | undefined => {
  const originalConfig = useTrajectoryChartConfigByAccessors(accessors);

  return useDeepMemo(() => {
    if (!originalConfig) {
      return undefined;
    }

    return Object.keys(originalConfig).reduce((config, key) => {
      return {
        ...config,
        [key]: get(customConfig, key, get(originalConfig, key)),
      };
    }, {} as ProjectConfigWellsTrajectoryCharts);
  }, [originalConfig]);
};
