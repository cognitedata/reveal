import { TrajectoryDataInternal } from 'domain/wells/trajectory/internal/types';

import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';

import { ProjectConfigWellsTrajectoryCharts } from '@cognite/discover-api-types';

import { DataError } from 'modules/inspectTabs/types';

import {
  EMPTY_CHART_COORDINATES,
  TRAJECTORY_COLUMN_NAME_MAP,
} from '../constants';
import { ChartCoordinates } from '../types';

import { getDataErrors } from './getDataErrors';

export const getChartCoordinates = (
  rows: TrajectoryDataInternal['rows'],
  chartData?: ProjectConfigWellsTrajectoryCharts['chartData']
): {
  coordinates: ChartCoordinates;
  errors: DataError[];
} => {
  if (!chartData) {
    return {
      coordinates: EMPTY_CHART_COORDINATES,
      errors: [],
    };
  }

  const { x: xAccessor, y: yAccessor, z: zAccessor } = chartData;

  return rows.reduce(
    ({ coordinates, errors }, row) => {
      const { x, y, z } = coordinates;

      const rowXAccessor = get(TRAJECTORY_COLUMN_NAME_MAP, xAccessor);
      const rowYAccessor = get(TRAJECTORY_COLUMN_NAME_MAP, yAccessor);
      const rowZAccessor = get(TRAJECTORY_COLUMN_NAME_MAP, zAccessor);

      const rowXValue: number | undefined = get(row, rowXAccessor);
      const rowYValue: number | undefined = get(row, rowYAccessor);
      const rowZValue: number | undefined = get(row, rowZAccessor);

      const xValueError = isUndefined(rowXValue);
      const yValueError = isUndefined(rowYValue);
      const zValueError = isUndefined(rowZValue);

      const updatedCoordinates = {
        x: xValueError ? [...x] : [...x, rowXValue],
        y: yValueError ? [...y] : [...y, rowYValue],
        z: zValueError ? [...z] : [...z, rowZValue],
      };

      const newErrors = getDataErrors(chartData, {
        x: xValueError,
        y: yValueError,
        z: zValueError,
      });

      return {
        coordinates: updatedCoordinates,
        errors: [...errors, ...newErrors],
      };
    },
    {
      coordinates: EMPTY_CHART_COORDINATES,
      errors: [] as DataError[],
    }
  );
};
