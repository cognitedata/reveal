import { TableDataItem } from 'src/modules/Common/types';

export const DateSorter = (data: TableDataItem[], reverse: boolean) => {
  const sortedData = data.sort((a, b) => {
    if (a.createdTime === undefined) return 1;
    if (b.createdTime === undefined) return -1;
    return a.createdTime.valueOf() - b.createdTime.valueOf();
  });
  return reverse ? sortedData.reverse() : sortedData;
};
