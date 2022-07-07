import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { LabelDefinitionFilterRequest } from '@cognite/sdk';

export const getLabelsByQuery = (query?: LabelDefinitionFilterRequest) => {
  return getCogniteSDKClient().labels.list(query);
};
