import { CogniteInternalId, CogniteExternalId } from '@cognite/sdk';

import { ResourceType } from '@data-exploration-lib/core';

export interface BaseResourceProps {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
  type: ResourceType;
}
