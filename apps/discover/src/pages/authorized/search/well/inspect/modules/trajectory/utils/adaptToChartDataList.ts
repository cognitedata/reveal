import { ProjectConfigWellsTrajectoryCharts } from '@cognite/discover-api-types';

import { DataError } from 'modules/inspectTabs/types';

import { ChartDataList, TrajectoryView } from '../types';

import { getChartCoordinates } from './getChartCoordinates';
import { getChartType } from './getChartType';

export const adaptToChartDataList = (
  trajectories: TrajectoryView[],
  trajectoryCharts: ProjectConfigWellsTrajectoryCharts[]
): ChartDataList => {
  const errorsMap = new Map<string, DataError[]>();

  const data = trajectoryCharts.map(({ type, chartData, chartExtraData }) => {
    return trajectories.map(({ wellboreMatchingId, wellboreName, rows }) => {
      const { coordinates, errors } = getChartCoordinates(rows, chartData);

      const currentErrors = errorsMap.get(wellboreMatchingId) || [];
      const updatedErrors = [...currentErrors, ...errors];
      errorsMap.set(wellboreMatchingId, updatedErrors);

      return {
        name: wellboreName,
        mode: 'lines',
        type: getChartType(type),
        ...coordinates,
        ...chartExtraData,
      };
    });
  });

  return {
    data,
    errors: Object.fromEntries(errorsMap),
  };
};
