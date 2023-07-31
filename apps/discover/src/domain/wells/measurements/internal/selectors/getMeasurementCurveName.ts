import { DepthMeasurementDataColumnInternal } from '../types';

export const getMeasurementCurveName = (
  column: DepthMeasurementDataColumnInternal
) => {
  const { externalId, measurementTypeParent } = column;

  if (
    !measurementTypeParent ||
    externalId.toLowerCase() === measurementTypeParent.toLowerCase()
  ) {
    return externalId;
  }

  return `${externalId} (${measurementTypeParent})`;
};
