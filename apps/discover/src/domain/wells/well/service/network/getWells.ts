import { getWellSDKClient } from 'domain/wells/utils/authenticate';

import { fetchAllCursors, FetchOptions } from 'utils/fetchAllCursors';

import { Well } from '@cognite/sdk-wells-v3';

import { mapWellFilterToWellFilterRequest } from 'modules/wellSearch/sdk/utils';
import { CommonWellFilter } from 'modules/wellSearch/types';

export const getWells = (
  wellFilter: CommonWellFilter,
  options?: FetchOptions
) => {
  return fetchAllCursors<Well>({
    signal: options?.signal,
    action: getWellSDKClient().wells.list,
    actionProps: {
      ...mapWellFilterToWellFilterRequest(wellFilter),
      // limit: 101,
    },
  });
};
