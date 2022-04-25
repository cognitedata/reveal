import { getWellSDKClient } from 'services/wellSearch/sdk/authenticate';
import { fetchAllCursors, FetchOptions } from 'utils/fetchAllCursors';

import { Wellbore, Npt } from '@cognite/sdk-wells-v3';

import { toIdentifier } from 'modules/wellSearch/sdk/utils';

import { EVENT_PER_PAGE } from './common';

export const nptFetchAll = async ({
  wellboreIds,
  options,
}: {
  wellboreIds: Set<Wellbore['matchingId']>;
  options?: FetchOptions;
}) => {
  return fetchAllCursors<Npt>({
    signal: options?.signal,
    action: getWellSDKClient().npt.list,
    actionProps: {
      filter: { wellboreIds: Array.from(wellboreIds).map(toIdentifier) },
      limit: EVENT_PER_PAGE,
    },
  });
};
