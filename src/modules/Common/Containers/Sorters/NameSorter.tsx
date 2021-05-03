import { TableDataItem } from '../../Types';

export const NameSorter = (data: TableDataItem[], reverse: boolean) => {
  const sortedData = data.sort((a: TableDataItem, b: TableDataItem) =>
    a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
  );
  return reverse ? sortedData.reverse() : sortedData;
};
