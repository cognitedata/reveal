import { MeasurementType } from 'modules/wellSearch/types';

import { MeasurementView } from '../types';

import { getUniqCurvesOfMeasurementType } from './getUniqCurvesOfMeasurementType';

export const getUniqOtherCurves = (data: MeasurementView[]) =>
  getUniqCurvesOfMeasurementType(
    [MeasurementType.FIT, MeasurementType.LOT],
    data
  );
