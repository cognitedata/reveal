import { DepthMeasurementDataColumnInternal } from 'domain/wells/measurements/internal/types';

import flatten from 'lodash/flatten';

import { MEASUREMENT_EXTERNAL_ID_CONFIG } from 'modules/wellSearch/constants';
import { MeasurementType } from 'modules/wellSearch/types';

export const filterCurvesByMeasurementTypes = (
  measurementTypes: Array<MeasurementType>,
  curves: Array<DepthMeasurementDataColumnInternal>
) => {
  const chosenTypes = Object.values(
    flatten(
      measurementTypes.map(
        (measurementType) => MEASUREMENT_EXTERNAL_ID_CONFIG[measurementType]
      )
    )
  );
  return curves.filter((column) => {
    const found = chosenTypes.find((type) => {
      return type === column.measurementType;
    });

    return found;
  });
};
