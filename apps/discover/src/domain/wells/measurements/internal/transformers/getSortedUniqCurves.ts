import flatten from 'lodash/flatten';
import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';

import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import { WellboreMeasurementsMapV3 as WellboreMeasurementsMap } from 'modules/wellSearch/types';

export const getSortedUniqCurves = (
  data: WellboreMeasurementsMap
): DepthMeasurementColumn[] => {
  const measurements = flatten(Object.values(data));
  const allColumns = measurements.flatMap((measurement) => measurement.columns);
  const uniqueColumns = uniqBy(allColumns, (column) => column.columnExternalId);
  return sortBy(uniqueColumns, 'column.columnExternalId');
};
