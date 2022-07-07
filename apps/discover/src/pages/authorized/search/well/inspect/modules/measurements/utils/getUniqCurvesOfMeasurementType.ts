import { MeasurementType } from 'modules/wellSearch/types';

import { MeasurementView } from '../types';

import { filterCurvesByMeasurementTypes } from './filterCurvesByMeasurementTypes';
import { getSortedUniqCurves } from './getSortedUniqCurves';

export const getUniqCurvesOfMeasurementType = (
  measurementTypes: Array<MeasurementType>,
  data: MeasurementView[]
) => {
  return filterCurvesByMeasurementTypes(
    measurementTypes,
    getSortedUniqCurves(data)
  );
};
