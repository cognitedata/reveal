import {
  CogniteClient,
  CogniteExternalId,
  Relationship,
  RelationshipResourceType,
} from '@cognite/sdk';

import { filterRelationships } from './filterRelationships';

type Payload = {
  sourceExternalIds: CogniteExternalId[];
  targetTypes?: RelationshipResourceType[];
};

export const getTargetRelationships = async (
  sdk: CogniteClient,
  payload: Payload
): Promise<Relationship[]> => {
  return filterRelationships(sdk, payload);
};
