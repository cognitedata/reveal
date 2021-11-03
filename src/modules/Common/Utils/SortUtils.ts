import { TableDataItem } from 'src/modules/Common/types';
import { FileInfo } from '@cognite/cdf-sdk-singleton';

type ValueType = Omit<TableDataItem, 'menuActions' | 'rowKey'> & {
  annotationCount: number;
};

export const Sorters: {
  [key: string]: {
    transform: (data: ValueType, stateTransformValue?: any) => any;
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
};

export const sortState = (
  allFiles: any[],
  sortKey: string | undefined,
  reverse: boolean | undefined
) => {
  let sortedData: FileInfo[];
  if (sortKey) {
    const sorter = Sorters[sortKey];
    const dataArr = allFiles.map((value, index) => {
      return { index, value: sorter.transform(value) };
    });
    const sortedTransformValues = dataArr.sort((a, b) =>
      sorter.sort(a.value, b.value, !!reverse)
    );

    sortedData = sortedTransformValues.map((val) => allFiles[val.index]);
  } else {
    sortedData = allFiles;
  }
  return sortedData;
};
