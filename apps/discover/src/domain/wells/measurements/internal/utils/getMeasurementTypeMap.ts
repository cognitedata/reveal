import { WdlMeasurementType } from 'domain/wells/measurements/service/types';

import { MEASUREMENT_EXTERNAL_ID_CONFIG } from '../config/measurementExternalIdConfig';
import { MeasurementTypeParent } from '../types';

/**
 * When we need to find the `measurmeentTypeParent` for a given `measurementType`,
 * creating a reverse map makes the above process efficient.
 * This utility funtion returns that reverse map.
 *
 * @returns Record<WdlMeasurementType, MeasurementTypeParent>
 */
export const getMeasurementTypeMap = () => {
  return Object.keys(MEASUREMENT_EXTERNAL_ID_CONFIG).reduce(
    (map, measurementType) => {
      const wdlMeasurementTypes =
        MEASUREMENT_EXTERNAL_ID_CONFIG[
          measurementType as MeasurementTypeParent
        ];

      const wdlMeasurementTypesMap = wdlMeasurementTypes.reduce(
        (map, wdlMeasurementType) => ({
          ...map,
          [wdlMeasurementType]: measurementType,
        }),
        {} as Record<WdlMeasurementType, MeasurementTypeParent>
      );

      return {
        ...map,
        ...wdlMeasurementTypesMap,
      };
    },
    {} as Record<WdlMeasurementType, MeasurementTypeParent>
  );
};
