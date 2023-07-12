import {
  CogniteClient,
  CogniteExternalId,
  Relationship,
  RelationshipResourceType,
} from '@cognite/sdk';

import { filterRelationships } from './filterRelationships';

type Payload = {
  targetExternalIds: CogniteExternalId[];
  sourceTypes?: RelationshipResourceType[];
};

export const getSourceRelationships = async (
  sdk: CogniteClient,
  payload: Payload
): Promise<Relationship[]> => {
  return filterRelationships(sdk, payload);
};
