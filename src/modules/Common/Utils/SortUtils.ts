import { TableDataItem } from 'src/modules/Common/types';

type ValueType = Omit<TableDataItem, 'menuActions' | 'rowKey'> & {
  annotationCount: number;
};

export const SortKeys = {
  name: 'name',
  mimeType: 'mimeType',
  annotations: 'annotations',
  uploadedTime: 'uploadedTime',
  createdTime: 'createdTime',
  indexInSortedArray: 'indexInSortedArray',
};

const timestampSorter = (a: Date, b: Date, reverse: boolean) => {
  if (reverse) {
    if (a === undefined) return -1;
    if (b === undefined) return 1;
    return b.valueOf() - a.valueOf();
  }
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  return a.valueOf() - b.valueOf();
};

// todo: add tests
export const Sorters: {
  [key: string]: {
    transform: (data: any, transformParam?: any) => any;
    sort: (a: any, b: any, reverse: boolean) => any;
  };
} = {
  [SortKeys.name]: {
    transform: (data: ValueType) => data.name,
    sort: (a: string, b: string, reverse: boolean) => {
      if (reverse) {
        return a.toLowerCase() < b.toLowerCase() ? 1 : -1;
      }
      return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
    },
  },
  [SortKeys.mimeType]: {
    transform: (data: ValueType) => data.mimeType,
    sort: (a: string, b: string, reverse: boolean) => {
      if (reverse) {
        return !a || !b || a.toLowerCase() < b.toLowerCase() ? 1 : -1;
      }
      return a && b && a.toLowerCase() > b.toLowerCase() ? 1 : -1;
    },
  },
  [SortKeys.annotations]: {
    transform: (data: ValueType) => {
      return data.annotationCount;
    },
    sort: (a: number, b: number, reverse: boolean) => {
      if (reverse) {
        return a < b ? 1 : -1;
      }
      return a > b ? 1 : -1;
    },
  },
  [SortKeys.uploadedTime]: {
    transform: (data: ValueType) => data.uploadedTime,
    sort: timestampSorter,
  },
  [SortKeys.createdTime]: {
    transform: (data: ValueType) => data.createdTime,
    sort: timestampSorter,
  },
  [SortKeys.indexInSortedArray]: {
    transform: (data: number, idIndexMapOfSortedArray: Map<number, number>) =>
      idIndexMapOfSortedArray.get(data),
    sort: (a: number, b: number) => {
      if (a === undefined && b === undefined) {
        return 0;
      }
      if (a === undefined) {
        return 1;
      }
      if (b === undefined) {
        return -1;
      }
      return a - b;
    },
  },
};

export const GenericSort = <T>(
  allItems: T[],
  sortKey: string | undefined,
  reverse: boolean | undefined,
  transformParameter?: any
) => {
  let sortedItems: T[];
  if (sortKey && allItems.length) {
    const sorter = Sorters[sortKey];
    const dataArr = allItems.map((value, index) => {
      return { index, value: sorter.transform(value, transformParameter) };
    });
    const sortedTransformValues = dataArr.sort((a, b) =>
      sorter.sort(a.value, b.value, !!reverse)
    );

    sortedItems = sortedTransformValues.map((val) => allItems[val.index]);
  } else {
    sortedItems = allItems;
  }
  return sortedItems;
};
