import { SequenceDataError } from 'domain/wells/types';
import { keyBySequence } from 'domain/wells/wellbore/internal/transformers/keyBySequence';

import {
  DepthMeasurementDataInternal,
  DepthMeasurementInternal,
  DepthMeasurementWithData,
} from '../types';

import { mergeDepthColumns } from './mergeDepthColumns';

export const mergeDepthMeasurementsAndData = (
  depthMeasurements: DepthMeasurementInternal[],
  depthMeasurementsData: (DepthMeasurementDataInternal | SequenceDataError)[]
) => {
  const keyedDepthMeasurementsData = keyBySequence(depthMeasurementsData);

  return depthMeasurements.reduce((mergedData, depthMeasurement) => {
    const { sequenceExternalId } = depthMeasurement.source;
    const depthMeasurementData = keyedDepthMeasurementsData[sequenceExternalId];
    const depthMeasurementDataColumns =
      'columns' in depthMeasurementData ? depthMeasurementData.columns : [];

    const depthMeasurementWithData = {
      ...(depthMeasurementData as DepthMeasurementDataInternal),
      ...depthMeasurement,
      columns: mergeDepthColumns(
        depthMeasurement.columns,
        depthMeasurementDataColumns
      ),
    };

    return [...mergedData, depthMeasurementWithData];
  }, [] as DepthMeasurementWithData[]);
};
