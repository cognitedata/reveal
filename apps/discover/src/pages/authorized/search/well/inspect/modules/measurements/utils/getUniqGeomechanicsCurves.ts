import { MeasurementType } from 'modules/wellSearch/types';

import { MeasurementView } from '../types';

import { getUniqCurvesOfMeasurementType } from './getUniqCurvesOfMeasurementType';

export const getUniqGeomechanicsCurves = (data: MeasurementView[]) =>
  getUniqCurvesOfMeasurementType([MeasurementType.GEOMECHANNICS], data);
