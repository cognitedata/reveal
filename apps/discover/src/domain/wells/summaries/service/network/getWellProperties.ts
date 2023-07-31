import { getWellSDKClient } from 'domain/wells/utils/authenticate';

import { fetchAllCursors } from 'utils/fetchAllCursors';

import {
  WellPropertiesEnum,
  WellPropertiesSummaryRow,
} from '@cognite/sdk-wells';

export const getWellProperties = async (items: Array<WellPropertiesEnum>) => {
  return fetchAllCursors<WellPropertiesSummaryRow>({
    action: getWellSDKClient().summaries.wellProperties,
    actionProps: { items },
  });
};
