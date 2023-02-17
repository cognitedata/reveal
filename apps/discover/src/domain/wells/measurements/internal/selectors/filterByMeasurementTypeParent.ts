import { MeasurementTypeParent } from 'domain/wells/measurements/internal/types';

import { BooleanMap } from 'utils/booleanMap';

export const filterByMeasurementTypeParent = <
  T extends { measurementTypeParent: MeasurementTypeParent }
>(
  data: T[],
  measurementTypeParentSelection: BooleanMap
) => {
  return data.filter(({ measurementTypeParent }) =>
    Boolean(measurementTypeParentSelection[measurementTypeParent])
  );
};
