import { SequenceDataError } from 'domain/wells/types';

import {
  DepthMeasurementDataInternal,
  DepthMeasurementInternal,
} from '../types';
import { getEmptyDepthMeasurementData } from '../utils/getEmptyDepthMeasurementData';

export const normalizeDepthMeasurementDataWithErrors = (
  depthMeasurement: DepthMeasurementInternal,
  depthMeasurementsData: DepthMeasurementDataInternal | SequenceDataError
): DepthMeasurementDataInternal => {
  if ('errors' in depthMeasurementsData) {
    return getEmptyDepthMeasurementData(depthMeasurement);
  }

  return depthMeasurementsData;
};
