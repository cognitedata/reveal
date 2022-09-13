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

      const props = {
        data: adapTrajectoryDataToChart(data, curveColor, chartConfig),
        axisNames,
      };

      return {
        ...chartsProps,
        [title]: props,
      };
    },
    {} as Record<string, Pick<PlotlyChartColumnProps, 'data' | 'axisNames'>>
  );
};
