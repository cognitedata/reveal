import compact from 'lodash/compact';

import { MeasurementType } from '@cognite/sdk-wells';

export const getTypesFromMeasurementTypes = (
  measurementTypes: MeasurementType[]
): string[] => {
  return compact(measurementTypes.map(({ type }) => type));
};
