import {
  type RelationshipsFilterRequest,
  type CogniteClient,
  type CogniteExternalId,
  type RelationshipResourceType
} from '@cognite/sdk';

import { filterRelationships } from './filterRelationships';
import { type ExtendedRelationshipWithSourceAndTarget } from '../../data-providers/types';

type Payload = {
  sourceExternalIds: CogniteExternalId[];
  targetTypes?: RelationshipResourceType[];
} & Omit<RelationshipsFilterRequest, 'targetExternalIds' | 'sourceTypes'>;

export const getTargetRelationships = async (
  sdk: CogniteClient,
  payload: Payload
): Promise<ExtendedRelationshipWithSourceAndTarget[]> => {
  const relationships = await filterRelationships(sdk, payload);
  return relationships.map((relationship) => ({
    ...relationship,
    relation: 'Target'
  }));
};
