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
import { type ExtendedRelationshipWithSourceAndTarget } from '../../data-providers/types';

type Payload = {
  targetExternalIds: CogniteExternalId[];
  sourceTypes?: RelationshipResourceType[];
} & Omit<RelationshipsFilterRequest, 'sourceExternalIds' | 'targetTypes'>;

export const getSourceRelationships = async (
  sdk: CogniteClient,
  payload: Payload
): Promise<ExtendedRelationshipWithSourceAndTarget[]> => {
  const relationships = await filterRelationships(sdk, payload);
  return relationships.map((relationship) => ({
    ...relationship,
    relation: 'Source'
  }));
};
