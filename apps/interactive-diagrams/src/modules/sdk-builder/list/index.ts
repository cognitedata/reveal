import {
  createAsyncThunk,
  createAction,
  PayloadAction,
} from '@reduxjs/toolkit';
import { InternalId } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { followCursorsGenerator } from 'helpers/Helpers';
import {
  ResourceState,
  ResourceType,
  ApiListResult,
  ApiResult,
  Query,
} from 'modules/types';
import { createListSelector } from './selectors';
import { updateAction as update } from '../reducers';

export const defaultListState: ApiListResult = {};
export interface ListStore {
  [key: string]: ApiListResult;
}
type ListPartialAction = {
  filter: Query;
  all: boolean;
  partition: number;
  nth: number;
  result: number[];
};

function getKey(scope: any, all: any) {
  return JSON.stringify({
    ...scope,
    all,
    cursor: undefined,
  });
}

function getSubkey(nth: number, partitions: number): string {
  return `${nth}/${partitions}`;
}

export default function buildList<T extends InternalId, Q extends Query>(
  resourceType: ResourceType,
  processItemFn: (t: T) => T = (t) => t
) {
  const list = {
    action: createAsyncThunk(
      `${resourceType}/list`,
      async (
        {
          filter,
          all = false,
          partition = 1,
          nth = 1,
          shouldFetch = (i: ApiResult) => !i?.status || i.status !== 'success',
        }: {
          filter: Q;
          all?: boolean;
          partition?: number;
          nth?: number;
          shouldFetch?: (i: ApiResult) => boolean;
        },
        { dispatch, getState }: any
      ) => {
        const state = getState()[resourceType];
        const key = getKey(filter, all);
        const subkey = getSubkey(nth, partition);

        if (
          state.list[key]?.[subkey] &&
          !shouldFetch(state.list[key][subkey])
        ) {
          return {};
        }

        // @ts-ignore
        const q: Q =
          partition === 1 && nth === 1
            ? filter
            : {
                ...filter,
                partition: subkey,
              };
        // @ts-ignore
        const listFn = sdk[resourceType].list as (
          q: Q
        ) => Promise<{ items: T[]; nextCursor?: string }>;

        let items = [] as T[];
        if (all) {
          const generator = followCursorsGenerator<Q, T>(q, listFn);
          /* eslint-disable no-restricted-syntax */
          for await (const partialItems of generator) {
            items = items.concat(partialItems);
            const partialIds = partialItems.map((t: T) => t.id);
            const partiallyDoneAction = {
              filter,
              all,
              partition,
              nth,
              result: partialIds,
            };
            const itemsToUpdate = partialItems.map(processItemFn);
            dispatch(update(resourceType)(itemsToUpdate));
            dispatch(listPartiallyDoneAction()(partiallyDoneAction));
          }
        } else {
          ({ items } = await listFn(q));
          const itemsToUpdate = items.map(processItemFn);
          dispatch(update(resourceType)(itemsToUpdate));
        }

        return {
          filter,
          result: items.map((t: T) => t.id),
          all,
          partition,
          nth,
        } as ListPartialAction;
      }
    ),
    pending: (state: any, action: any) => {
      const { filter, all = false, partition = 1, nth = 1 } = action.meta.arg;
      const key = getKey(filter, all);
      const subkey = getSubkey(nth, partition);
      if (!state.list[key]) {
        state.list[key] = {};
      }
      if (!state.list[key][subkey]) {
        state.list[key][subkey] = { ...defaultListState };
      }
      state.list[key][subkey].status = 'pending';
    },
    rejected: (state: any, action: any) => {
      const { filter, all = false, partition = 1, nth = 1 } = action.meta.arg;
      const key = getKey(filter, all);
      const subkey = getSubkey(nth, partition);
      state.list[key][subkey].status = 'error';
    },
    fulfilled: (state: any, action: any) => {
      if (!action.payload) return;
      const {
        filter,
        result: ids,
        all = false,
        partition = 1,
        nth = 1,
      } = action.payload;
      const key = getKey(filter, all);
      const subkey = getSubkey(nth, partition);
      state.list[key][subkey].status = 'success';
      state.list[key][subkey].ids = ids;
    },
  };

  /**
   * Additional action used when all of the items are being fetched and there is a need to use cursor.
   */
  const listPartiallyDoneAction = () =>
    createAction(
      `${resourceType}/list/partiallyDone`,
      ({ filter, all, partition, nth, result }: ListPartialAction) => {
        return {
          payload: {
            filter,
            all,
            partition,
            nth,
            result,
          },
        };
      }
    );
  const listPartiallyDone = (
    state: ResourceState<T>,
    action: PayloadAction<ListPartialAction>
  ) => {
    const { filter, all, partition, nth, result: ids } = action.payload;
    const key = getKey(filter, all);
    const subkey = getSubkey(nth, partition);
    state.list[key][subkey].ids = [
      ...(state.list[key][subkey].ids ?? []),
      ...ids,
    ];
  };

  const listParallelAction = (filter: Q, parallelity: number = 5) => {
    return async (dispatch: any) => {
      return Promise.all(
        [...Array(parallelity).keys()].map((i) =>
          dispatch(
            list.action({
              filter,
              all: true,
              partition: parallelity,
              nth: i + 1,
            })
          )
        )
      );
    };
  };

  const listSelector = createListSelector<T, Q>( // @ts-ignore
    (state: RootState) => state[resourceType].items.list, // @ts-ignore
    (state: RootState) => state[resourceType].list
  ) as any;

  return {
    list,
    listParallel: listParallelAction,
    listPartiallyDoneAction,
    listPartiallyDone,
    listSelector,
  };
}
