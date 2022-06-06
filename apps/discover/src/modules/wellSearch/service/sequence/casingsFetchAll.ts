import { getWellSDKClient } from 'domain/wells/utils/authenticate';

import { fetchAllCursors, FetchOptions } from 'utils/fetchAllCursors';

import { Wellbore, CasingSchematic } from '@cognite/sdk-wells-v3';

import { toIdentifier } from 'modules/wellSearch/sdk/utils';

export const casingsFetchAll = async ({
  wellboreIds,
  options,
}: {
  wellboreIds: Set<Wellbore['matchingId']>;
  options?: FetchOptions;
}) => {
  return fetchAllCursors<CasingSchematic>({
    signal: options?.signal,
    action: getWellSDKClient().casings.list,
    actionProps: {
      filter: { wellboreIds: Array.from(wellboreIds).map(toIdentifier) },
      //   limit: LIMIT,
    },
  });
};
