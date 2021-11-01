import { FileInfo } from '@cognite/cdf-sdk-singleton';

export const chunkFileIds = (
  items: FileInfo[],
  bulkSize: number
): number[][] => {
  const fileIds = items.map((item) => item.id);
  const bulkedIds: any = [];
  for (let i = 0; i < items.length; i += bulkSize) {
    bulkedIds.push(fileIds.slice(i, i + bulkSize));
  }
  return bulkedIds;
};
