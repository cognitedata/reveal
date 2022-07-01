import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import {
  WellboreMeasurementsMapV3 as WellboreMeasurementsMap,
  MeasurementTypeV3 as MeasurementType,
} from 'modules/wellSearch/types';

import { filterCurvesByMeasurementTypes } from './filterCurvesByMeasurementTypes';
import { getSortedUniqCurves } from './getSortedUniqCurves';

export const getUniqCurvesOfMeasurementType = (
  measurementTypes: Array<MeasurementType>,
  data?: WellboreMeasurementsMap
) => {
  if (!data) return [] as DepthMeasurementColumn[];
  return filterCurvesByMeasurementTypes(
    measurementTypes,
    getSortedUniqCurves(data)
  );
};
