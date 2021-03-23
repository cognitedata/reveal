import isFinite from 'lodash/isFinite';
import { createSelector } from 'reselect';
import { InternalId } from '@cognite/sdk';
import { RootState } from 'store';
import { ResourceType, Item } from '../sdk-builder/types';

import {
  countSelector as countFileSelector,
  listSelector as listFileSelector,
  searchSelector as searchFileSelector,
} from '../files';
import {
  countSelector as countAssetSelector,
  listSelector as listAssetSelector,
  searchSelector as searchAssetSelector,
} from '../assets';

const filters = {
  none: (i: Item) => i,
  missingAssetId: (i: Item) => (i.assetId ? undefined : i),
};

export const getActiveSelectionId = createSelector(
  (state: RootState) => state.selection.active,
  (activeSelection) => (type: ResourceType) => activeSelection[type]
);

export const getCountsSelector = createSelector(
  countAssetSelector,
  countFileSelector,
  (assetCounter, fileCounter) => (type: ResourceType) => {
    switch (type) {
      case 'files':
        return fileCounter;
      case 'assets':
        return assetCounter;
      default:
        throw new Error(`type '${type}' not supported`);
    }
  }
);

export const getItemsSearchSelector = createSelector(
  searchFileSelector,
  searchAssetSelector,
  (fileSearch, assetSearch) => (type: ResourceType) => {
    switch (type) {
      case 'assets':
        return assetSearch;
      case 'files':
        return fileSearch;
      default:
        throw new Error(`type '${type}' is not supported`);
    }
  }
);

export const getItemListSelector = createSelector(
  listFileSelector,
  listAssetSelector,
  (fileList, assetList) => (type: ResourceType) => {
    switch (type) {
      case 'assets':
        return assetList;
      case 'files':
        return fileList;
      default:
        throw new Error(`type '${type}' is not supported`);
    }
  }
);

/// FACTORIES

export const dataKitLengthSelectorFactory = (
  datakitId: string,
  all: boolean = false
) => {
  return createSelector(
    (state: RootState) => {
      const { endpoint, query } = state.selection.items[datakitId] || {};
      return { endpoint, query };
    },
    (state: RootState) => {
      const { type } = state.selection.items[datakitId];
      return state[type]?.list;
    },
    (state: RootState) => {
      const { type } = state.selection.items[datakitId];
      return state[type]?.items.list;
    },
    ({ endpoint, query }, list, items): number => {
      switch (endpoint) {
        case 'retrieve': {
          return (query as InternalId[])
            .map((i) => i.id)
            .filter(Boolean)
            .filter((i) => !!items[i]).length;
        }
        case 'list': {
          const listings: any = list;
          const key = JSON.stringify({ ...query, all });
          const request = listings[key] || {};
          return Object.values(request).reduce(
            (accl, r: any) => accl + r?.ids?.length || 0,
            0
          ) as number;
        }
        default: {
          throw new Error('unknown endpoint');
        }
      }
    }
  );
};

export const dataKitTypeSelectorFactory = (datakitId: string) => {
  return (state: RootState) => {
    const { type } = state.selection.items[datakitId];
    return type;
  };
};

export const dataKitItemsSelectorFactory = (
  datakitId: string,
  all: boolean = false
) => {
  return (state: RootState) => {
    if (!state.selection?.items[datakitId]) {
      return [];
    }
    const { type, endpoint, query, filter } = state.selection.items[datakitId];
    const filterKey = filter ?? 'missingAssetId';
    const filterFn = filters[filterKey];
    const key = JSON.stringify({ ...query, all });
    const { list: items } = state[type]?.items;

    switch (endpoint) {
      case 'list': {
        const partitions = state[type]?.list[key] || {};
        const ids = Object.values(partitions).reduce(
          (accl: any, partition: any) => accl.concat(partition.ids || []),
          []
        ) as number[];
        return (ids
          .map((id: number) => items[id])
          .filter(Boolean) as Item[]).filter(filterFn);
      }
      case 'retrieve': {
        const ids = query.map((i: any) =>
          isFinite(i.id) ? i.id : -1
        ) as number[];
        return (ids.map((id) => items[id]).filter(Boolean) as Item[]).filter(
          filterFn
        );
      }
      default: {
        throw new Error('Unsupported endpoint');
      }
    }
  };
};

export const dataKitItemMapSelectorFactory = (
  datakitId: string,
  all: boolean = false
) =>
  createSelector(dataKitItemsSelectorFactory(datakitId, all), (items) =>
    items.reduce((accl, i) => {
      if (i) {
        return {
          ...accl,
          [i.id]: i,
        };
      }
      return accl;
    }, {} as any)
  );

export const dataKitCountSelectorFactory = (datakitId: string) =>
  createSelector(
    (state: RootState) => state.selection.items,
    getCountsSelector,
    (datakits, countSelector) => {
      const { type, query, endpoint } = datakits[datakitId];
      switch (endpoint) {
        case 'list': {
          // @ts-ignore
          return countSelector(type)(query)?.count || 0;
        }
        case 'retrieve': {
          return query?.length || 0;
        }
        default: {
          throw new Error('Unsupported endpoint');
        }
      }
    }
  );

export const dataKitStatusSelectorFactory = (
  dataKitId: string,
  all: boolean = false
) => (state: RootState) => {
  const { type, endpoint, query } = state.selection.items[dataKitId];
  const key = JSON.stringify({ ...query, all });
  if (!type) {
    throw new Error('Unknown data kit');
  }
  switch (endpoint) {
    case 'list': {
      const partitions = Object.values(state[type]?.list[key] || {});
      const done: boolean =
        partitions.length > 0
          ? partitions.reduce(
              (accl: boolean, p: any) => accl && !!p?.done,
              true
            )
          : false;
      const loading: boolean = partitions.reduce(
        (accl: boolean, p: any) => accl || p?.fetching,
        false
      );
      const error: boolean = partitions.reduce(
        (accl: boolean, p: any) => accl || p?.error,
        false
      );

      return { done, loading, error };
    }
    case 'retrieve': {
      const ids = Object.values(query || {})
        .map((q: any) => q.id)
        .filter(Boolean);
      const status = state[type].items.retrieve.byId;
      const done: boolean =
        ids.filter((id) => status[id]?.status === 'success').length ===
        ids.length;
      const loading: boolean = !!ids.find(
        (id) => status[id]?.status === 'pending'
      );
      const error: boolean = !!ids.find((id) => status[id]?.status === 'error');

      return { done, loading, error };
    }
    default: {
      throw new Error('Unknown endpoint');
    }
  }
};
