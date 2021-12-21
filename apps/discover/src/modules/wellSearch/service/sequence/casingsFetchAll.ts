import { Wellbore, CasingSchematic } from '@cognite/sdk-wells-v3';

import { fetchAllCursors } from '_helpers/fetchAllCursors';
import { toIdentifier } from 'modules/wellSearch/sdk/utils';
import { getWellSDKClient } from 'modules/wellSearch/sdk/v3';

export const casingsFetchAll = async ({
  wellboreIds,
}: {
  wellboreIds: Set<Wellbore['matchingId']>;
}) => {
  return fetchAllCursors<CasingSchematic>({
    action: getWellSDKClient().casings.list,
    actionProps: {
      filter: { wellboreIds: Array.from(wellboreIds).map(toIdentifier) },
      //   limit: LIMIT,
    },
  });
};
