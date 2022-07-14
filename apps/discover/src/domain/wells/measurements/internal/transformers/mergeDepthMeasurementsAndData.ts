import { SequenceDataError } from 'domain/wells/types';
import { keyBySequence } from 'domain/wells/wellbore/internal/transformers/keyBySequence';

import {
  DepthMeasurementDataInternal,
  DepthMeasurementInternal,
  DepthMeasurementWithData,
} from '../types';

import { mergeDepthColumns } from './mergeDepthColumns';
import { normalizeDepthMeasurementDataWithErrors } from './normalizeDepthMeasurementDataWithErrors';

export const mergeDepthMeasurementsAndData = (
  depthMeasurements: DepthMeasurementInternal[],
  depthMeasurementsData: (DepthMeasurementDataInternal | SequenceDataError)[]
) => {
  const keyedDepthMeasurementsData = keyBySequence(depthMeasurementsData);

  return depthMeasurements.reduce((mergedData, depthMeasurement) => {
    const { sequenceExternalId } = depthMeasurement.source;
    const depthMeasurementData = normalizeDepthMeasurementDataWithErrors(
      depthMeasurement,
      keyedDepthMeasurementsData[sequenceExternalId]
    );

    const depthMeasurementWithData = {
      ...depthMeasurementData,
      ...depthMeasurement,
      columns: mergeDepthColumns(
        depthMeasurement.columns,
        depthMeasurementData.columns
      ),
    };

    return [...mergedData, depthMeasurementWithData];
  }, [] as DepthMeasurementWithData[]);
};
