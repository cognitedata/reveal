import { CogniteInternalId, CogniteExternalId } from '@cognite/sdk';

export interface BaseResourceProps {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
}
