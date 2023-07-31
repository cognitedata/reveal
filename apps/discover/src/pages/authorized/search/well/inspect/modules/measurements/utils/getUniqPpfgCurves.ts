import { MeasurementType } from 'modules/wellSearch/types';

import { MeasurementView } from '../types';

import { getUniqCurvesOfMeasurementType } from './getUniqCurvesOfMeasurementType';

export const getUniqPpfgCurves = (data: MeasurementView[]) =>
  getUniqCurvesOfMeasurementType([MeasurementType.PPFG], data);
