import { getWellSDKClient } from 'domain/wells/utils/authenticate';
import { convertToIdentifiers } from 'domain/wells/utils/convertToIdentifiers';

import { fetchAllCursors } from 'utils/fetchAllCursors';

import { Well, Wellbore } from '@cognite/sdk-wells';

export const getWellboresByWellIds = async (
  // Matching id of a well or a wellbore.
  wellMatchingIds: Array<Well['matchingId']>
) => {
  return fetchAllCursors<Wellbore>({
    action: getWellSDKClient().wellbores.retrieveMultiple,
    actionProps: {
      items: convertToIdentifiers(wellMatchingIds),
      ignoreUnknownIds: true,
    },
  });
};
