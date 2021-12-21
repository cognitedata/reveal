import { Wellbore, Npt } from '@cognite/sdk-wells-v3';

import { fetchAllCursors } from '_helpers/fetchAllCursors';
import { toIdentifier } from 'modules/wellSearch/sdk/utils';
import { getWellSDKClient } from 'modules/wellSearch/sdk/v3';

import { EVENT_PER_PAGE } from './common';

export const nptFetchAll = async ({
  wellboreIds,
}: {
  wellboreIds: Set<Wellbore['matchingId']>;
}) => {
  return fetchAllCursors<Npt>({
    action: getWellSDKClient().npt.list,
    actionProps: {
      filter: { wellboreIds: Array.from(wellboreIds).map(toIdentifier) },
      limit: EVENT_PER_PAGE,
    },
  });
};
