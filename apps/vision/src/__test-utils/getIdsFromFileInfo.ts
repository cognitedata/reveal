import { FileInfo } from '@cognite/sdk';

export const getIdsFromFileInfo = (items: FileInfo[]): number[] =>
  items.map((data) => data.id);
