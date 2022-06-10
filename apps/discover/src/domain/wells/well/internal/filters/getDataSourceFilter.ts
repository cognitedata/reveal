import { isStringsArray } from 'utils/types/isStringsArray';

import { WellFilter } from '@cognite/sdk-wells-v3';

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
