import { keyBySequence } from 'domain/wells/wellbore/internal/transformers/keyBySequence';

import {
  DepthMeasurementDataInternal,
  DepthMeasurementInternal,
  DepthMeasurementWithData,
} from '../types';

import { mergeDepthColumns } from './mergeDepthColumns';

export const mergeDepthMeasurementsAndData = (
  depthMeasurements: DepthMeasurementInternal[],
  depthMeasurementsData: DepthMeasurementDataInternal[]
) => {
  const keyedDepthMeasurementsData = keyBySequence(depthMeasurementsData);

  return depthMeasurements.reduce((mergedData, depthMeasurement) => {
    const { sequenceExternalId } = depthMeasurement.source;
    const depthMeasurementData = keyedDepthMeasurementsData[sequenceExternalId];

    const depthMeasurementWithData = {
      ...depthMeasurement,
      ...depthMeasurementData,
      columns: mergeDepthColumns(
        depthMeasurement.columns,
        depthMeasurementData.columns
      ),
    };

    return [...mergedData, depthMeasurementWithData];
  }, [] as DepthMeasurementWithData[]);
};
