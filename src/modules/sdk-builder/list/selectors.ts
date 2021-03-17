import { createSelector } from '@reduxjs/toolkit';
import { InternalId } from '@cognite/sdk';
import { RootState } from 'store';
import {
  ApiResult,
  Result,
  ItemsList,
  Query,
  Status,
  ListState,
} from '../types';
import { defaultListState } from '.';

type Partition = {
  status: Status;
  ids: number[];
};
type List = {
  [key: string]: {
    [subkey: string]: Partition;
  };
};

export function createListSelector<T extends InternalId, Q extends Query>(
  itemListSelector: (_: RootState) => ItemsList<T>,
  listSelector: (_: RootState) => ListState
): (_: RootState) => (q: Q, all: boolean) => Result<T> {
  const listIncludingItemsSelector: any = createSelector(
    itemListSelector,
    listSelector,
    (allItems: any, list: List) => {
      // This will create a full new set of objects, even though only
      // a subset is changed. Can be optimized, e.g with immer.
      const searchKeys = Object.keys(list);
      return searchKeys.reduce((accl, key: string) => {
        const partitions: Partition[] = Object.values(
          list[key] || { '1/1': { ...defaultListState } }
        );
        const ids: number[] = partitions.reduce(
          (a: number[], p: ApiResult) => a.concat(p.ids || []),
          []
        );
        const items: T[] = ids
          .map((id: number) => allItems[id])
          .filter((item: any) => !!item) as T[];
        const doneCount = partitions.filter(
          (partition: Partition) => partition.status === 'success'
        ).length;
        const progress = doneCount === 0 ? 0 : doneCount / partitions.length;
        const status = (): Status => {
          const error = partitions.find(
            (partition: Partition) => partition.status === 'error'
          );
          const pending = partitions.find(
            (partition: Partition) => partition.status === 'pending'
          );
          if (error) return 'error';
          if (pending) return 'pending';
          return 'success';
        };

        return {
          ...accl,
          [key]: {
            items,
            ids,
            progress,
            status: status(),
          },
        };
      }, {} as { [key: string]: Result<T> });
    }
  ) as any;

  return createSelector(
    listIncludingItemsSelector,
    (list: { [key: string]: Result<T> }) => (filter: Q, all: boolean) => {
      const key: string = JSON.stringify({ ...filter, all });
      return (list[key] ?? {
        status: undefined,
        ids: [],
        items: [],
      }) as Result<T>;
    }
  );
}
