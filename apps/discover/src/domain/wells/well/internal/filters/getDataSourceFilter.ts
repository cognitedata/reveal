import { isStringsArray } from 'utils/types/isStringsArray';

import { WellFilter } from '@cognite/sdk-wells';

export const getDataSourceFilter = (
  value?: unknown
): Pick<WellFilter, 'sources'> => {
  if (isStringsArray(value)) {
    return {
      sources: value,
    };
  }

  return {};
};
