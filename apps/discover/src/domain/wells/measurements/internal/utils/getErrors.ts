import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';
import { hasMeasurementCurveConfig } from 'domain/wells/measurements/internal/utils/hasMeasurementCurveConfig';

import { DataError, Errors } from 'modules/inspectTabs/types';

export const getErrors = (data: DepthMeasurementWithData[]): Errors => {
  return data.reduce((errors, { wellboreMatchingId, columns }) => {
    const wellboreErrors = new Set<DataError>();
    const measurementTypesWithoutParent = new Set<string>();
    const curvesWithoutConfig = new Set<string>();

    columns.forEach((column) => {
      const { externalId, measurementTypeParent, measurementType } = column;

      if (!measurementTypeParent) {
        measurementTypesWithoutParent.add(measurementType);
      } else if (!hasMeasurementCurveConfig(column)) {
        curvesWithoutConfig.add(externalId);
      }
    });

    if (measurementTypesWithoutParent.size) {
      wellboreErrors.add({
        message: 'Cannot resolve measurement types:',
        items: Array.from(measurementTypesWithoutParent),
      });
    }

    if (curvesWithoutConfig.size) {
      wellboreErrors.add({
        message: 'Line config missing:',
        items: Array.from(curvesWithoutConfig),
      });
    }

    return {
      ...errors,
      [wellboreMatchingId]: Array.from(wellboreErrors),
    };
  }, {} as Errors);
};
