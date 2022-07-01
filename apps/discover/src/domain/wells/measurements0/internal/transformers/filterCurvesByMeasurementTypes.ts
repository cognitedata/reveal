import flatten from 'lodash/flatten';

import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import { MEASUREMENT_EXTERNAL_ID_CONFIG } from 'modules/wellSearch/constants';
import { MeasurementTypeV3 as MeasurementType } from 'modules/wellSearch/types';

export const filterCurvesByMeasurementTypes = (
  measurementTypes: Array<MeasurementType>,
  curves: Array<DepthMeasurementColumn>
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
