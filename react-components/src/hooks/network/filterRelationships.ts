/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient, type Relationship, type RelationshipsFilter } from '@cognite/sdk';

type RelationshipWithResources = {
  source?: Record<string, any>;
  target?: Record<string, any>;
};

export const filterRelationships = async (
  sdk: CogniteClient,
  filter?: RelationshipsFilter
): Promise<Relationship[]> => {
  const fetch = async (): Promise<Relationship[]> => {
    const response = await sdk.relationships
      .list({
        filter,
        fetchResources: true
      })
      .autoPagingToArray({ limit: -1 });

    return response.filter(isValidRelationship);
  };

  return await fetch();
};

const isValidRelationship = (relationship: Relationship): boolean => {
  const relationshipWithResources = relationship as RelationshipWithResources;

  return Boolean(relationshipWithResources.source) && Boolean(relationshipWithResources.target);
};
