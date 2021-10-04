import { createSelector } from '@reduxjs/toolkit';
import { InternalId } from '@cognite/sdk';
import { RootState } from 'store';
import {
  Status,
  Result,
  ItemsList,
  ItemsState,
  ItemStatus,
  ItemsAsyncStatus,
} from 'modules/types';

/**
 * Selects item by either ID or External ID.
 */
export function createItemSelector<T extends InternalId>(
  itemListSelector: (_: RootState) => ItemsList<T>,
  itemRetrieveByExternalIdSelector: (_: RootState) => ItemsAsyncStatus
): (_: RootState) => (id: number | string | undefined) => T | undefined {
  return createSelector(
    itemListSelector,
    itemRetrieveByExternalIdSelector,
    (items: ItemsList<T>, byExternalId: any) =>
      (id: number | string | undefined) => {
        const isExternalId = typeof id === 'string';
        if (!id) return undefined;
        if (!isExternalId) {
          return items[id];
        }
        const itemId = byExternalId[id]?.id;
        return itemId ? items[itemId] : undefined;
      }
  );
}

/**
 * Maps items to their external IDs.
 */
export function createExternalIdMapSelector<T extends InternalId>(
  itemsSelector: (_: RootState) => ItemsState<T>
) {
  return createSelector(itemsSelector, (items: ItemsState<T>) => {
    const {
      list,
      retrieve: { byExternalId },
    } = items;
    const externalIds = Object.keys(byExternalId);
    const itemsMappedToIds = externalIds
      .filter((externalId: string) => byExternalId[externalId].id)
      .map((externalId: string) => {
        const { id } = byExternalId[externalId];
        const item = list[id!];
        return {
          id: item,
        };
      });
    return itemsMappedToIds;
  });
}

export function createRetrieveSelector<T extends InternalId>(
  itemListSelector: (_: RootState) => ItemsList<T>,
  itemRetrieveByIdSelector: (_: RootState) => ItemsAsyncStatus
): (_: RootState) => (ids: InternalId[]) => Result<T> {
  return createSelector(
    itemListSelector,
    itemRetrieveByIdSelector,
    (allItems: ItemsList<T>, allRequests: ItemsAsyncStatus) =>
      (ids: InternalId[]) => {
        const requests: ItemStatus[] = ids.map(({ id }) => allRequests[id]);
        const items: ItemsList<T>[] = ids
          .map((item) => allItems[item.id])
          .filter((item) => !!item) as any[];
        const statusFilter = (status: Status) =>
          requests.filter((request) => request?.status === status).length;
        const done = statusFilter('success');
        const progress = statusFilter('pending');
        const error = statusFilter('error');
        const fetching = !!progress;
        return {
          progress,
          fetching,
          done,
          error,
          items,
        } as unknown as Result<T>;
      }
  );
}
