import { createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import sdk from 'sdk-singleton';
import { ExternalId, InternalId, CogniteInternalId } from '@cognite/sdk';
import { RootState } from 'store';
import {
  ResourceType,
  ItemsList,
  ItemsState,
  ItemsAsyncStatus,
} from '../types';
import {
  createItemSelector,
  createExternalIdMapSelector,
  createRetrieveSelector,
} from './selectors';

export default function buildItems<
  T extends InternalId & { externalId?: string },
  U extends { id: CogniteInternalId; update: any }
>(resourceType: ResourceType) {
  /**
   * Updates the state[resourceType].items.list with actual data.
   */
  const updateItems = (state: any, action: PayloadAction<{ items: T[] }>) => {
    const { items: itemsToUpdate } = action.payload;
    const mappedItems: { [key: string]: T } = {};
    itemsToUpdate.forEach((item: T) => {
      mappedItems[item.id ?? item.externalId] = { ...item };
    });
    itemsToUpdate.forEach((item: T) => {
      const mappedItem = mappedItems[item.id];
      if (mappedItem) state.items.list[item.id] = mappedItem;
    });
  };

  /**
   * Retrieves items by their ids.
   * Shares a lot of code with retrieveByExternalId, could clean this up some time.
   */
  const retrieveItemsById = {
    action: createAsyncThunk(
      `${resourceType}/retrieveByIds`,
      async (
        { ids }: { ids: InternalId[] },
        { dispatch, getState }: { dispatch: any; getState: any }
      ) => {
        const items: any = await sdk[resourceType].retrieve(ids); // fix any
        const state = getState()[resourceType];
        const itemAction = {
          payload: { items },
          type: `${resourceType}/retrieveByIds`,
        };
        dispatch(updateItems(state, itemAction));
        return { items, ids };
      }
    ),
    pending: (state: any, action: any) => {
      const { ids } = action.meta.arg;
      ids.forEach((item: InternalId) => {
        state.items.retrieve.byId = {
          ...state.items.retrieve.byId,
          [item.id]: { status: 'pending', id: item.id },
        };
      });
    },
    rejected: (state: any, action: any) => {
      const { ids } = action.meta.arg;
      ids.forEach((item: InternalId) => {
        state.items.retrieve.byId = {
          ...state.items.retrieve.byId,
          [item.id]: { status: 'error', id: item.id },
        };
      });
    },
    fulfilled: (
      state: any,
      action: PayloadAction<{ items: T[]; ids: InternalId[] }>
    ) => {
      const { items } = action.payload;
      items.forEach((item: InternalId) => {
        state.items.retrieve.byId = {
          ...state.items.retrieve.byId,
          [item.id]: { status: 'success', id: item.id },
        };
      });
    },
  };

  /**
   * Retrieves items by their external ids.
   * Shares a lot of code with retrieveById, could clean this up some time.
   */
  const retrieveItemsByExternalId = {
    action: createAsyncThunk(
      `${resourceType}/retrieveByExternalIds`,
      async (
        { ids }: { ids: ExternalId[] },
        { dispatch, getState }: { dispatch: any; getState: any }
      ) => {
        const items: any = await sdk[resourceType].retrieve(ids); // fix any
        const state = getState()[resourceType];
        const itemAction = {
          payload: { items },
          type: `${resourceType}/retrieveByExternalIds`,
        };
        dispatch(updateItems(state, itemAction));
        return {
          items,
          ids,
        };
      }
    ),
    pending: (state: any, action: any) => {
      const { ids } = action.meta.arg;
      ids.forEach((item: ExternalId) => {
        state.items.retrieve.byExternalId = {
          ...state.items.retrieve.byExternalId,
          [item.externalId]: {
            ...state.items.retrieve.byExternalId[item.externalId],
            status: 'pending',
          },
        };
      });
    },
    rejected: (state: any, action: any) => {
      const { ids } = action.meta.arg;
      ids.forEach((item: ExternalId) => {
        state.items.retrieve.byExternalId = {
          ...state.items.retrieve.byExternalId,
          [item.externalId]: {
            ...state.items.retrieve.byExternalId[item.externalId],
            status: 'error',
          },
        };
      });
    },
    fulfilled: (
      state: any,
      action: PayloadAction<{ items: T[]; ids: ExternalId[] }>
    ) => {
      const { items } = action.payload;
      items.forEach((item: any) => {
        state.items.retrieve.byExternalId = {
          ...state.items.retrieve.byExternalId,
          [item.externalId]: {
            status: 'success',
            id: item.id,
          },
        };
      });
    },
  };

  /**
   * Updated items by their ids.
   * Shares a lot of code with updateByExternalId, could clean this up some time.
   */
  const updateItemsById = {
    action: createAsyncThunk(
      `${resourceType}/updateByIds`,
      async (
        { updates }: { updates: U[] },
        { dispatch, getState }: { dispatch: any; getState: any }
      ) => {
        const items: any = await sdk[resourceType].update(updates); // fix any
        const state = getState()[resourceType];
        const itemAction = {
          payload: { items },
          type: `${resourceType}/updateByIds`,
        };
        dispatch(updateItems(state, itemAction));
        return {
          items,
          updates,
        };
      }
    ),
    pending: (state: any, action: any) => {
      const { updates } = action.meta.arg;
      updates.forEach((item: U) => {
        state.items.update.byId = {
          ...state.items.update.byId,
          [item.id]: { ...state.items.update.byId[item.id], status: 'pending' },
        };
      });
    },
    rejected: (state: any, action: any) => {
      const { updates } = action.meta.arg;
      updates.forEach((item: U) => {
        state.items.update.byId = {
          ...state.items.update.byId,
          [item.id]: { ...state.items.update.byId[item.id], status: 'error' },
        };
      });
    },
    fulfilled: (
      state: any,
      action: PayloadAction<{ items: T[]; updates: U[] }>
    ) => {
      const { items } = action.payload;
      items.forEach((item: T) => {
        state.items.update.byId = {
          ...state.items.update.byId,
          [item.id]: { status: 'success', id: item.id },
        };
      });
    },
  };

  const itemSelector = createItemSelector<T>(
    // @ts-ignore
    (state: RootState) => state[resourceType].items.list as ItemsList<T>,
    (state: RootState) =>
      state[resourceType].items.retrieve.byExternalId as ItemsAsyncStatus
  ) as any;

  const externalIdMapSelector = createExternalIdMapSelector<T>(
    // @ts-ignore
    (state: RootState) => state[resourceType].items as ItemsState<T>
  ) as any;

  const retrieveSelector = createRetrieveSelector<T>(
    // @ts-ignore
    (state: RootState) => state[resourceType].items.list as ItemsList<T>,
    (state: RootState) =>
      state[resourceType].items.retrieve.byId as ItemsAsyncStatus
  ) as any;

  return {
    updateItems,
    retrieveItemsById,
    retrieveItemsByExternalId,
    updateItemsById,
    itemSelector,
    externalIdMapSelector,
    retrieveSelector,
  };
}
