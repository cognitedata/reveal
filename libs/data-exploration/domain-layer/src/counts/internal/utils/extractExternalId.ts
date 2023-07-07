import get from 'lodash/get';

import { CogniteExternalId, IdEither } from '@cognite/sdk';

export const extractExternalId = (
  resourceId?: IdEither
): CogniteExternalId | undefined => {
  return get(resourceId, 'externalId');
};
