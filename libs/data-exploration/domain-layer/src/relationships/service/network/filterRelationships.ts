import { CogniteClient, Relationship, RelationshipsFilter } from '@cognite/sdk';

export const filterRelationships = async (
  sdk: CogniteClient,
  filter: RelationshipsFilter
): Promise<Relationship[]> => {
  let cursor: string | undefined;

  const fetchAction = async () => {
    return sdk.relationships
      .list({
        filter,
        cursor,
        limit: 1000,
      })
      .then(({ items, nextCursor }) => {
        cursor = nextCursor;
        return items;
      })
      .catch(() => {
        cursor = undefined;
        return [] as Relationship[];
      });
  };

  let relationships: Relationship[] = await fetchAction();

  while (cursor) {
    relationships = [...relationships, ...(await fetchAction())];
  }

  return relationships;
};
