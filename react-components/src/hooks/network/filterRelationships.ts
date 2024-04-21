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
  filter: RelationshipsFilter,
  fetchResources = true
): Promise<Relationship[]> => {
  let cursor: string | undefined;

  const fetch = async (): Promise<Relationship[]> => {
    return await sdk.relationships
      .list({
        filter,
        cursor,
        limit: 1000,
        fetchResources
      })
      .then(({ items, nextCursor }) => {
        cursor = nextCursor;
        return items.filter(isValidRelationship);
      })
      .catch(() => {
        cursor = undefined;
        return [] as Relationship[];
      });
  };

  let relationships: Relationship[] = [];

  do {
    relationships = relationships.concat(await fetch());
    // eslint-disable-next-line no-unmodified-loop-condition
  } while (cursor !== undefined);

  return relationships;
};

const isValidRelationship = (relationship: Relationship): boolean => {
  const relationshipWithResources = relationship as RelationshipWithResources;

  return Boolean(relationshipWithResources.source) && Boolean(relationshipWithResources.target);
};
