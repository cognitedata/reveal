import { MeasurementsViewColumn } from '../types';

export const getCurveName = (column: MeasurementsViewColumn) => {
  const { externalId, measurementTypeParent } = column;

  if (
    !measurementTypeParent ||
    externalId.toLowerCase() === measurementTypeParent.toLowerCase()
  ) {
    return externalId;
  }

  return `${externalId} (${measurementTypeParent})`;
};
