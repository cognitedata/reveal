/*!
 * Copyright 2024 Cognite AS
 */
import {
  type RelationshipsFilterRequest,
  type CogniteClient,
  type CogniteExternalId,
  type RelationshipResourceType
} from '@cognite/sdk';

import { getSourceRelationships } from './getSourceRelationships';
import { getTargetRelationships } from './getTargetRelationships';
import { type ExtendedRelationship } from '../../data-providers/types';

type Payload = {
  resourceExternalIds: CogniteExternalId[];
  relationshipResourceTypes?: RelationshipResourceType[];
} & Omit<
  RelationshipsFilterRequest,
  'sourceExternalIds' | 'targetExternalIds' | 'sourceTypes' | 'targetTypes'
>;

export const getRelationships = async (
  sdk: CogniteClient,
  payload: Payload
): Promise<ExtendedRelationship[]> => {
  const { resourceExternalIds, relationshipResourceTypes, ...rest } = payload;

  const [sourceRelationships, targetRelationships] = await Promise.all([
    getSourceRelationships(sdk, {
      targetExternalIds: resourceExternalIds,
      sourceTypes: relationshipResourceTypes,
      ...rest
    }),
    getTargetRelationships(sdk, {
      sourceExternalIds: resourceExternalIds,
      targetTypes: relationshipResourceTypes,
      ...rest
    })
  ]);
  return [...sourceRelationships, ...targetRelationships];
};
