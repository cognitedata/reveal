import { SourceItems } from '@cognite/sdk-wells-v3';

export const getNamesFromSourceItems = (sourceItems: SourceItems) => {
  return sourceItems.items.map(({ name }) => name);
};
