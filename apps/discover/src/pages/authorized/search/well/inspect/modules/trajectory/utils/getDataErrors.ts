import { DataError } from 'modules/inspectTabs/types';

import { CHART_PLANES } from '../constants';
import { ChartPlane } from '../types';

export const getDataErrors = (
  accessors: Record<ChartPlane, string>,
  errorStatus: Record<ChartPlane, boolean>
): DataError[] => {
  const errors = new Set<DataError>([]);

  CHART_PLANES.forEach((plane) => {
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
