import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';

import { PlotlyChartColumnProps } from '../components/PlotlyChartColumn';
import { TrajectoryCurveConfig } from '../types';

import { adapTrajectoryDataToChart } from './adapTrajectoryDataToChart';

export const adaptToTrajectoryCurveDataProps = (
  trajectoryCurveConfigs: TrajectoryCurveConfig[],
  data: TrajectoryWithData,
  curveColor: string
) => {
  return trajectoryCurveConfigs.reduce(
    (chartsProps, { chartConfig, title, axisNames }) => {
      if (!title) {
        return chartsProps;
      }

      return {
        ...chartsProps,
        [title]: {
          data: adapTrajectoryDataToChart(data, curveColor, chartConfig),
          axisNames,
          /**
           * In stick charts, default scale is increasing from top to bottom.
           * So, we need the invert of this config value.
           */
          reverseYAxis: !chartConfig.reverseYAxis,
        },
      };
    },
    {} as Record<string, Partial<PlotlyChartColumnProps>>
  );
};
