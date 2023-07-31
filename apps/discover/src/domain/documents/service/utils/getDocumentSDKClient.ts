import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { CogniteClient } from '@cognite/sdk';

export const getDocumentSDKClient = (): CogniteClient['documents'] => {
  return getCogniteSDKClient().documents;
};
