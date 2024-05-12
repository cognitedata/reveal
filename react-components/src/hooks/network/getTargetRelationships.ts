/*!
 * Copyright 2024 Cognite AS
 */
import {
  type RelationshipsFilterRequest,
  type CogniteClient,
  type CogniteExternalId,
  type RelationshipResourceType
} from '@cognite/sdk';

import { filterRelationships } from './filterRelationships';
import { type ExtendedRelationship } from '../../utilities/types';

type Payload = {
  sourceExternalIds: CogniteExternalId[];
  targetTypes?: RelationshipResourceType[];
} & Omit<RelationshipsFilterRequest, 'targetExternalIds' | 'sourceTypes'>;

export const getTargetRelationships = async (
  sdk: CogniteClient,
  payload: Payload
): Promise<ExtendedRelationship[]> => {
  const relationships = await filterRelationships(sdk, payload);
  return relationships.map((relationship) => ({
    ...relationship,
    relation: 'Target'
  }));
};
