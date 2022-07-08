import { SourceItems } from '@cognite/sdk-wells';

export const getNamesFromSourceItems = (sourceItems: SourceItems) => {
  return sourceItems.items.map(({ name }) => name);
};
