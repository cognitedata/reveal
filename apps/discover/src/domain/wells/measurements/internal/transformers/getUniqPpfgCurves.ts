import {
  WellboreMeasurementsMapV3 as WellboreMeasurementsMap,
  MeasurementTypeV3 as MeasurementType,
} from 'modules/wellSearch/types';

import { getUniqCurvesOfMeasurementType } from './getUniqCurvesOfMeasurementType';

export const getUniqPpfgCurves = (data?: WellboreMeasurementsMap) =>
  getUniqCurvesOfMeasurementType([MeasurementType.PPFG], data);
