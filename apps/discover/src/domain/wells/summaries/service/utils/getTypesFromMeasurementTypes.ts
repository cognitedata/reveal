import compact from 'lodash/compact';

import { MeasurementType } from '@cognite/sdk-wells-v3';

export const getTypesFromMeasurementTypes = (
  measurementTypes: MeasurementType[]
): string[] => {
  return compact(measurementTypes.map(({ type }) => type));
};
