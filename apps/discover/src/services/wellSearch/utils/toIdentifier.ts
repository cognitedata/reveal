import { Identifier } from '@cognite/sdk-wells-v3';

export const toIdentifier = (id: number | string): Identifier => {
  return { matchingId: String(id) };
};

export const toIdentifierItems = (items: Identifier[]) => {
  return { items };
};
