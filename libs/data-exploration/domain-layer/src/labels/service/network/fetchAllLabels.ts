import { CogniteClient } from '@cognite/sdk';

export const fetchAllLabels = async (sdk: CogniteClient) => {
  let { items, nextCursor } = await sdk.labels.list();

  while (nextCursor) {
    const response = await sdk.labels.list({
      cursor: nextCursor,
    });
    nextCursor = response.nextCursor;
    items = [...items, ...response.items];
  }

  return items;
};
