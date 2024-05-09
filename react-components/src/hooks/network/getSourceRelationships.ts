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
  targetExternalIds: CogniteExternalId[];
  sourceTypes?: RelationshipResourceType[];
} & Omit<RelationshipsFilterRequest, 'sourceExternalIds' | 'targetTypes'>;

export const getSourceRelationships = async (
  sdk: CogniteClient,
  payload: Payload
): Promise<ExtendedRelationship[]> => {
  return await filterRelationships(sdk, payload).then((relationships) => {
    return relationships.map((relationship) => ({
      ...relationship,
      relation: 'Source'
    }));
  });
};
