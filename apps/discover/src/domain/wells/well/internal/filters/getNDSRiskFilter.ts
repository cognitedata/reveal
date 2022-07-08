import { filters } from 'domain/wells/well/internal/filters';

import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';

import { WellFilter } from '@cognite/sdk-wells';

export const getNDSRiskFilter = (value?: unknown): Pick<WellFilter, 'nds'> => {
  if (isEmpty(value)) {
    return {};
  }

  if (isArray(value)) {
    return {
      nds: {
        exists: true,
        riskTypes: filters.toContainsAny(value),
      },
    };
  }

  return {};
};
