import { Wellbore, Npt } from '@cognite/sdk-wells-v3';

import { fetchAllCursors, FetchOptions } from '_helpers/fetchAllCursors';
import { toIdentifier } from 'modules/wellSearch/sdk/utils';
import { getWellSDKClient } from 'modules/wellSearch/sdk/v3';

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
