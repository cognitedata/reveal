import {
  WellboreMeasurementsMapV3 as WellboreMeasurementsMap,
  MeasurementTypeV3 as MeasurementType,
} from 'modules/wellSearch/types';

import { getUniqCurvesOfMeasurementType } from './getUniqCurvesOfMeasurementType';

export const getUniqOtherCurves = (data?: WellboreMeasurementsMap) =>
  getUniqCurvesOfMeasurementType(
    [MeasurementType.FIT, MeasurementType.LOT],
    data
  );
