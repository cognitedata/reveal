import { getTrajectoryCurveCoordinates } from 'domain/wells/trajectory/internal/selectors/getTrajectoryCurveCoordinates';
import { getTrajectoryChartType } from 'domain/wells/trajectory/internal/utils/getTrajectoryChartType';

import { PlotData } from 'plotly.js';

import { ProjectConfigWellsTrajectoryCharts } from '@cognite/discover-api-types';

import { DataError } from 'modules/inspectTabs/types';

import { DEFAULT_TRAJECTORY_CURVE_COLOR } from '../../constants';
import {
  TrajectoryChartDataList,
  TrajectoryCurveFormatterData,
  TrajectoryWithData,
} from '../types';

export const adaptToTrajectoryChartDataList = <T extends TrajectoryWithData>(
  trajectories: T[],
  trajectoryCharts: ProjectConfigWellsTrajectoryCharts[],
  formatCurveData?: ({
    trajectoryChart,
    trajectory,
  }: TrajectoryCurveFormatterData<T>) => Partial<PlotData>
): TrajectoryChartDataList => {
  const errorsMap = new Map<string, DataError[]>();

  const data = trajectoryCharts.map((trajectoryChart) => {
    const { type, chartData, chartExtraData } = trajectoryChart;

    return trajectories
      .filter((trajectory): trajectory is T => !!trajectory)
      .map((trajectory) => {
        const { wellboreMatchingId, rows } = trajectory;

        const { coordinates, errors } = getTrajectoryCurveCoordinates(
          rows,
          chartData
        );

        const currentErrors = errorsMap.get(wellboreMatchingId) || [];
        const updatedErrors = [...currentErrors, ...errors];
        errorsMap.set(wellboreMatchingId, updatedErrors);

        return {
          mode: 'lines',
          type: getTrajectoryChartType(type),
          line: {
            color: DEFAULT_TRAJECTORY_CURVE_COLOR,
          },
          ...coordinates,
          ...chartExtraData,
          ...formatCurveData?.({ trajectoryChart, trajectory }),
        };
      });
  });

  return {
    data,
    errors: Object.fromEntries(errorsMap),
  };
};
