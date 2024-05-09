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
  return await filterRelationships(sdk, payload).then((relationships) => {
    return relationships.map((relationship) => ({
      ...relationship,
      relation: 'Target'
    }));
  });
};
