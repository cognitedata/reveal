import { TableDataItem } from 'src/modules/Common/types';

type ValueType = Omit<TableDataItem, 'menuActions' | 'rowKey'> & {
  annotationCount: number;
};

export const SorterNames = {
  name: 'name',
  mimeType: 'mimeType',
  annotations: 'annotations',
  createdTime: 'createdTime',
  indexInSortedArray: 'indexInSortedArray',
};

export const Sorters: {
  [key: string]: {
    transform: (data: any, stateTransformValue?: any) => any;
    sort: (a: any, b: any, reverse: boolean) => any;
  };
} = {
  name: {
    transform: (data: ValueType) => data.name,
    sort: (a: string, b: string, reverse: boolean) => {
      if (reverse) {
        return a.toLowerCase() < b.toLowerCase() ? 1 : -1;
      }
      return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
    },
  },
  mimeType: {
    transform: (data: ValueType) => data.mimeType,
    sort: (a: string, b: string, reverse: boolean) => {
      if (reverse) {
        return !a || !b || a.toLowerCase() < b.toLowerCase() ? 1 : -1;
      }
      return a && b && a.toLowerCase() > b.toLowerCase() ? 1 : -1;
    },
  },
  annotations: {
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
  createdTime: {
    transform: (data: ValueType) => data.createdTime,
    sort: (a: Date, b: Date, reverse: boolean) => {
      if (reverse) {
        if (a === undefined) return -1;
        if (b === undefined) return 1;
        return b.valueOf() - a.valueOf();
      }
      if (a === undefined) return 1;
      if (b === undefined) return -1;
      return a.valueOf() - b.valueOf();
    },
  },
  indexInSortedArray: {
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
