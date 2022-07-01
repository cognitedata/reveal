import {
  WellboreMeasurementsMapV3 as WellboreMeasurementsMap,
  MeasurementTypeV3 as MeasurementType,
} from 'modules/wellSearch/types';

import { getUniqCurvesOfMeasurementType } from './getUniqCurvesOfMeasurementType';

export const getUniqGeomechanicsCurves = (data?: WellboreMeasurementsMap) =>
  getUniqCurvesOfMeasurementType([MeasurementType.GEOMECHANNICS], data);
