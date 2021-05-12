import { createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import sdk from 'sdk-singleton';
import { ExternalId, InternalId, CogniteInternalId } from '@cognite/sdk';
import { RootState } from 'store';
import {
  ResourceType,
  ItemsList,
  ItemsState,
  ItemsAsyncStatus,
} from 'modules/types';
import {
  createItemSelector,
  createExternalIdMapSelector,
  createRetrieveSelector,
} from './selectors';
import { updateAction as update } from '../reducers';

export default function buildItems<
  T extends InternalId & { externalId?: string },
  U extends { id: CogniteInternalId; update: any }
>(resourceType: ResourceType) {
  /**
   * Retrieves items by their ids.
   * Shares a lot of code with retrieveByExternalId, could clean this up some time.
   */
  const retrieveItemsById = {
    action: createAsyncThunk(
      `${resourceType}/retrieveByIds`,
      async (
        { ids }: { ids: InternalId[] },
        { dispatch }: { dispatch: any }
      ) => {
        try {
          const items: any = await sdk[resourceType].retrieve(ids); // fix any
          dispatch(update(resourceType)(items));
          return { items, ids };
        } catch (error) {
          return { items: [], ids: [] };
        }
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
        { dispatch }: { dispatch: any }
      ) => {
        const items: any = await sdk[resourceType].retrieve(ids); // fix any
        dispatch(update(resourceType)(items));
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
        { dispatch }: { dispatch: any }
      ) => {
        const items: any = await sdk[resourceType].update(updates); // fix any
        dispatch(update(resourceType)(items));
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
    retrieveItemsById,
    retrieveItemsByExternalId,
    updateItemsById,
    itemSelector,
    externalIdMapSelector,
    retrieveSelector,
  };
}
