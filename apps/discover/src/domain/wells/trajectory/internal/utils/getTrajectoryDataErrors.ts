import { DataError } from 'modules/inspectTabs/types';

import { TRAJECTORY_CHART_PLANES } from '../../constants';
import { TrajectoryChartPlane } from '../types';

export const getTrajectoryDataErrors = (
  accessors: Record<TrajectoryChartPlane, string>,
  errorStatus: Record<TrajectoryChartPlane, boolean>
): DataError[] => {
  const errors = new Set<DataError>([]);

  TRAJECTORY_CHART_PLANES.forEach((plane) => {
    if (accessors[plane] && errorStatus[plane]) {
      errors.add(getDataError(accessors[plane]));
    }
  });

  return Array.from(errors);
};

export const getDataError = (accessor: string): DataError => {
  return {
    message: `Error acquiring data for ${accessor}`,
  };
};
