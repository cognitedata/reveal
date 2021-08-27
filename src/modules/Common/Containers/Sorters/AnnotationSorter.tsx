import { TableDataItem } from '../../types';

export const AnnotationSorter = (
  data: TableDataItem[],
  reverse: boolean,
  sorterArgs?: any
) => {
  const fileAnnotationMap = sorterArgs as Record<number, number>[];
  const sortedData = data.sort((a: TableDataItem, b: TableDataItem) =>
    fileAnnotationMap[a.id] > fileAnnotationMap[b.id] ? 1 : -1
  );
  return reverse ? sortedData.reverse() : sortedData;
};
