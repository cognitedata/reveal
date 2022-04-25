import { getWellSDKClient } from 'services/wellSearch/sdk/authenticate';
import { fetchAllCursors, FetchOptions } from 'utils/fetchAllCursors';

import { Wellbore, Nds } from '@cognite/sdk-wells-v3';

import { toIdentifier } from 'modules/wellSearch/sdk/utils';

import { EVENT_PER_PAGE } from './common';

export const fetchAllNdsEvents = async ({
  wellboreIds,
  options,
}: {
  wellboreIds: Set<Wellbore['matchingId']>;
  options?: FetchOptions;
}) => {
  return fetchAllCursors<Nds>({
    signal: options?.signal,
    action: getWellSDKClient().nds.list,
    actionProps: {
      filter: { wellboreIds: Array.from(wellboreIds).map(toIdentifier) },
      limit: EVENT_PER_PAGE,
    },
  });
};
