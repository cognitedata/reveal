import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { WellLogView } from '../types';

export const adaptToWellLogView = (
  depthMeasurement: DepthMeasurementWithData,
  wellbore: WellboreInternal
): WellLogView => {
  const { source } = depthMeasurement;

  return {
    ...depthMeasurement,
    id: source.sequenceExternalId,
    wellboreName: wellbore.name,
    wellName: wellbore.wellName,
  };
};
