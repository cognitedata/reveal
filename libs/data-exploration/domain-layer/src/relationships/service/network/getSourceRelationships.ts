import {
  CogniteClient,
  CogniteExternalId,
  RelationshipResourceType,
  RelationshipsFilter,
} from '@cognite/sdk';

import { ExtendedRelationship } from '../types';

import { filterRelationships } from './filterRelationships';

interface Payload
  extends Omit<RelationshipsFilter, 'sourceExternalIds' | 'targetTypes'> {
  targetExternalIds: CogniteExternalId[];
  sourceTypes?: RelationshipResourceType[];
}

export const getSourceRelationships = async (
  sdk: CogniteClient,
  payload: Payload
): Promise<ExtendedRelationship[]> => {
  return filterRelationships(sdk, payload).then((relationships) => {
    return relationships.map((relationship) => ({
      ...relationship,
      relation: 'Source',
    }));
  });
};
