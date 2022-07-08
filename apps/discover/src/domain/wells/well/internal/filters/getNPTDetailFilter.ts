import { filters } from 'domain/wells/well/internal/filters';

import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';

import { WellFilter } from '@cognite/sdk-wells';

export const getNPTDetailFilter = (
  value?: unknown
): Pick<WellFilter, 'npt'> => {
  if (isEmpty(value)) {
    return {};
  }

  if (isArray(value)) {
    return {
      npt: {
        exists: true,
        nptCodeDetails: filters.toContainsAll(value),
      },
    };
  }

  return {};
};
