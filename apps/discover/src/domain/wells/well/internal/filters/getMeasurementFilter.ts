import { filters } from 'domain/wells/well/internal/filters';

import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';

import { WellFilter } from '@cognite/sdk-wells-v3';

export const getMeasurementFilter = (
  value?: unknown
): Pick<WellFilter, 'depthMeasurements'> => {
  if (isEmpty(value)) {
    return {};
  }

  if (isArray(value)) {
    return {
      depthMeasurements: {
        measurementTypes: filters.toContainsAny(value),
      },
    };
  }

  return {};
};
