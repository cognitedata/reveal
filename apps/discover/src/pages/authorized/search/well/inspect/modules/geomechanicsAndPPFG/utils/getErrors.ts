import { DataError, Errors } from 'modules/inspectTabs/types';

import { MeasurementsView } from '../types';

import { hasCurveConfig } from './getCurveConfig';

export const getErrors = (data: MeasurementsView[]): Errors => {
  return data.reduce((errors, { wellboreMatchingId, columns }) => {
    const wellboreErrors = new Set<DataError>();
    const measurementTypesWithoutParent = new Set<string>();
    const curvesWithoutConfig = new Set<string>();

    columns.forEach((column) => {
      const { externalId, measurementTypeParent, measurementType } = column;

      if (!measurementTypeParent) {
        measurementTypesWithoutParent.add(measurementType);
      } else if (!hasCurveConfig(column)) {
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
