import { getWellSDKClient } from 'domain/wells/utils/authenticate';

import { fetchAllCursors, FetchOptions } from 'utils/fetchAllCursors';

import { Well, WellFilterRequest } from '@cognite/sdk-wells-v3';

export const getWells = (
  wellFilterRequest: WellFilterRequest,
  options?: FetchOptions
) => {
  return fetchAllCursors<Well>({
    signal: options?.signal,
    action: getWellSDKClient().wells.list,
    actionProps: { ...wellFilterRequest },
  });
};
