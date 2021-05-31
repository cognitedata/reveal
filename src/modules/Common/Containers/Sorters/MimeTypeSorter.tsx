import { TableDataItem } from '../../types';

export const MimeTypeSorter = (data: TableDataItem[], reverse: boolean) => {
  const sortedData = data.sort((a: TableDataItem, b: TableDataItem) =>
    a.mimeType &&
    b.mimeType &&
    a.mimeType.toLowerCase() > b.mimeType.toLowerCase()
      ? 1
      : -1
  );
  return reverse ? sortedData.reverse() : sortedData;
};
