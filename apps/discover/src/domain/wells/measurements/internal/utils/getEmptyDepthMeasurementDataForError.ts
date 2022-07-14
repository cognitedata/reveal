import { SequenceDataError } from 'domain/wells/types';

import {
  DepthMeasurementDataInternal,
  DepthMeasurementInternal,
} from '../types';

import { getEmptyDepthMeasurementData } from './getEmptyDepthMeasurementData';

export const getEmptyDepthMeasurementDataForError = (
  depthMeasurement: DepthMeasurementInternal,
  depthMeasurementsData: DepthMeasurementDataInternal | SequenceDataError
): DepthMeasurementDataInternal => {
  if ('errors' in depthMeasurementsData) {
    return getEmptyDepthMeasurementData(depthMeasurement);
  }

  return depthMeasurementsData;
};
