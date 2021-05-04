import { TableDataItem } from '../../Types';

export const DateSorter = (data: TableDataItem[], reverse: boolean) => {
  const sortedData = data.sort((a, b) => {
    if (a.sourceCreatedTime === undefined) return 1;
    if (b.sourceCreatedTime === undefined) return -1;
    return a.sourceCreatedTime.valueOf() - b.sourceCreatedTime.valueOf();
  });
  return reverse ? sortedData.reverse() : sortedData;
};
