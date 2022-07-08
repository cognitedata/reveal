import { getWellSDKClient } from 'domain/wells/utils/authenticate';
import { convertToIdentifiers } from 'domain/wells/utils/convertToIdentifiers';

import { fetchAllCursors } from 'utils/fetchAllCursors';

import { Well } from '@cognite/sdk-wells';

export const getWellsByIds = async (
  wellMatchingIds: Array<Well['matchingId']>
) => {
  return fetchAllCursors<Well>({
    action: getWellSDKClient().wells.retrieveMultiple,
    actionProps: {
      items: convertToIdentifiers(wellMatchingIds),
      ignoreUnknownIds: true,
    },
  });
};
