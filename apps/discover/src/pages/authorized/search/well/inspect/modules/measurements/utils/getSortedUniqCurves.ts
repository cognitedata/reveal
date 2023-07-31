import { DepthMeasurementDataColumnInternal } from 'domain/wells/measurements/internal/types';

import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';

import { MeasurementView } from '../types';

export const getSortedUniqCurves = (
  data: MeasurementView[]
): DepthMeasurementDataColumnInternal[] => {
  const allColumns = data.flatMap((measurement) => measurement.columns);
  const uniqueColumns = uniqBy(allColumns, (column) => column.externalId);
  return sortBy(uniqueColumns, 'externalId');
};
