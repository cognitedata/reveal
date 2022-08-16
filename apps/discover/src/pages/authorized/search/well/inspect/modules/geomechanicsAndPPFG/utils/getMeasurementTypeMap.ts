import { WdlMeasurementType } from 'domain/wells/measurements/service/types';

import { MEASUREMENT_EXTERNAL_ID_CONFIG } from '../config/measurementExternalIdConfig';
import { MeasurementType } from '../types';

export const getMeasurementTypeMap = () => {
  return Object.keys(MEASUREMENT_EXTERNAL_ID_CONFIG).reduce(
    (map, measurementType) => {
      const wdlMeasurementTypes =
        MEASUREMENT_EXTERNAL_ID_CONFIG[measurementType as MeasurementType];

      const wdlMeasurementTypesMap = wdlMeasurementTypes.reduce(
        (map, wdlMeasurementType) => ({
          ...map,
          [wdlMeasurementType]: measurementType,
        }),
        {} as Record<WdlMeasurementType, MeasurementType>
      );

      return {
        ...map,
        ...wdlMeasurementTypesMap,
      };
    },
    {} as Record<WdlMeasurementType, MeasurementType>
  );
};
