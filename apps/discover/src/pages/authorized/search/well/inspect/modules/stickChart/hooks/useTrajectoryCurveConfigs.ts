import { useTrajectoryChartsConfig } from 'domain/wells/trajectory/internal/hooks/useTrajectoryChartsConfig';
import {
  TrajectoryChartDataAccessor,
  TrajectoryChartPlane,
} from 'domain/wells/trajectory/internal/types';
import { findChartConfigByAccessors } from 'domain/wells/trajectory/internal/utils/findChartConfigByAccessors';

import compact from 'lodash/compact';
import template from 'lodash/template';

import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { TrajectoryCurveConfig } from '../types';

export const CHARTS: Partial<
  Record<TrajectoryChartPlane, TrajectoryChartDataAccessor>
>[] = [
  { x: 'ed', y: 'tvd' },
  { x: 'x_offset', y: 'y_offset' },
];

export const useTrajectoryCurveConfigs = (): TrajectoryCurveConfig[] => {
  const chartConfigs = useTrajectoryChartsConfig();
  const { data: unit } = useUserPreferencesMeasurement();

  return useDeepMemo(() => {
    return compact(
      CHARTS.map((accessors) => {
        const chartConfig = findChartConfigByAccessors(chartConfigs, accessors);

        if (!chartConfig || !chartConfig.chartVizData) {
          return null;
        }

        const { axisNames: axes, title } = chartConfig.chartVizData;

        const axisNames = Object.keys(axes).reduce(
          (names, axis) => ({
            ...names,
            [axis]: template(axes[axis])({ unit }),
          }),
          {} as Record<string, string>
        );

        return {
          chartConfig,
          axisNames,
          title,
        };
      })
    );
  }, [chartConfigs]);
};
