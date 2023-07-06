import { CogniteInternalId, CogniteExternalId } from '@cognite/sdk';

import { ResourceType } from '@data-exploration-lib/core';

export type CountsResourceType = Exclude<ResourceType, 'threeD'>;

export type Counts = Record<CountsResourceType, number>;

export interface BaseResourceProps {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
}
