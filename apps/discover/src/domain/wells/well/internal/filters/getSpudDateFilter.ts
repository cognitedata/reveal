import { filters } from 'domain/wells/well/internal/filters';

import { adaptLocalDateToISOString } from 'utils/date';
import { isStringsArray } from 'utils/types/isStringsArray';

import { WellFilter } from '@cognite/sdk-wells';

export const getSpudDateFilter = (
  value?: unknown
): Pick<WellFilter, 'spudDate'> => {
  if (isStringsArray(value)) {
    return {
      spudDate: filters.toDateRange(value as [string, string]),
    };
  }

  if (Array.isArray(value)) {
    if (value[0] instanceof Date && value[1] instanceof Date) {
      return {
        spudDate: filters.toDateRange([
          adaptLocalDateToISOString(value[0]),
          adaptLocalDateToISOString(value[1]),
        ]),
      };
    }
  }

  return {};
};
