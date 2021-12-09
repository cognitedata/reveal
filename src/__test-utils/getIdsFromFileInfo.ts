import { FileInfo } from '@cognite/cdf-sdk-singleton';

export const getIdsFromFileInfo = (items: FileInfo[]): number[] =>
  items.map((data) => data.id);
