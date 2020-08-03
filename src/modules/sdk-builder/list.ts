import produce from 'immer';
import { Dictionary } from 'lodash';
import { createSelector } from 'reselect';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { InternalId } from '@cognite/sdk';
import { RootState } from 'reducers';
import { followCursorsGenerator } from 'helpers/Helpers';
import sdk from 'sdk-singleton';
import { ResourceType, ApiResult, Result, Query } from './types';

function getSubkey(nth: number, partitions: number): string {
  return `${nth}/${partitions}`;
}

export function generateItemCountSelector(
  type: ResourceType,
  query: any,
  all: boolean
) {
  return (state: RootState) => {
    const key = JSON.stringify({ ...query, all });
    const listRequests = Object.values(state[type].list[key] || {}).map(
      r => r.ids
    );
    return listRequests.reduce((accl, l) => accl + l.length, 0);
  };
}

export default function buildList<Q extends Query, T extends InternalId>(
  type: ResourceType,
  processItemFn: (t: T) => T = t => t
) {
  const LIST = `${type}/LIST`;
  const LIST_PARTIALLY_DONE = `${type}/LIST_PARTIALLY_DONE`;
  const LIST_DONE = `${type}/LIST_DONE`;
  const LIST_ERROR = `${type}/LIST_ERROR`;

  const UPDATE_ITEMS = `${type}/UPDATE_ITEMS`;

  // This fixes the inconsistency between time series.list and all
  // other list methods in the SDK.
  function uglySDKHacks(q: Q): Q {
    if (type === 'timeseries') {
      const actualQuery = q ? { ...q.filter, ...q } : {};
      delete actualQuery.filter;
      return actualQuery;
    }
    return q;
  }

  interface ListAction extends Action<typeof LIST> {
    scope: Q;
    all: boolean;
    partition: number;
    nth: number;
  }

  interface ListPartiallyDoneAction extends Action<typeof LIST_PARTIALLY_DONE> {
    scope: Q;
    result: number[];
    all: boolean;
    partition: number;
    nth: number;
  }

  interface ListDoneAction extends Action<typeof LIST_DONE> {
    scope: Q;
    result: number[];
    all: boolean;
    partition: number;
    nth: number;
  }

  interface ListErrorAction extends Action<typeof LIST_ERROR> {
    scope: Q;
    all: boolean;
    partition: number;
    nth: number;
  }

  interface RetrieveDoneAction extends Action<typeof UPDATE_ITEMS> {
    result: T[];
  }

  type ListActions =
    | ListAction
    | ListPartiallyDoneAction
    | ListDoneAction
    | ListErrorAction;
  type AllActions = ListActions | RetrieveDoneAction;

  interface ListStore {
    [key: string]: {
      [partition: string]: ApiResult;
    };
  }

  function listAction(
    scope: Q,
    all = false,
    partition = 1,
    nth = 1,
    shouldFetch = (i: ApiResult) => !i.fetching && !i.done
  ) {
    return async (
      dispatch: ThunkDispatch<any, any, AllActions>,
      getState: () => RootState
    ): Promise<void> => {
      const key = JSON.stringify({
        ...scope,
        cursor: undefined,
        all,
      });
      const subkey = getSubkey(nth, partition);
      const store: ListStore = getState()[type].list;

      if (
        store[key] &&
        store[key][subkey] &&
        !shouldFetch(store[key][subkey])
      ) {
        return;
      }

      dispatch({
        type: LIST,
        scope,
        all,
        partition,
        nth,
      });

      try {
        const q = uglySDKHacks(
          partition === 1 && nth === 1
            ? scope
            : {
                ...scope,
                partition: subkey,
              }
        );

        const listFn =
          // @ts-ignore
          sdk[type].list as (
            q: Q
          ) => Promise<{ items: T[]; nextCursor?: string }>;

        let items = [] as T[];
        if (all) {
          const generator = followCursorsGenerator<Q, T>(q, listFn);
          /* eslint-disable no-restricted-syntax */
          for await (const partialItems of generator) {
            /* eslint-enable no-restricted-syntax */
            items = items.concat(partialItems);
            dispatch({
              type: UPDATE_ITEMS,
              result: partialItems.map(processItemFn),
            });
            const partialIds = partialItems.map((t: T) => t.id);
            dispatch({
              type: LIST_PARTIALLY_DONE,
              scope,
              result: partialIds,
              all,
              partition,
              nth,
            });
          }
        } else {
          ({ items } = await listFn(q));
          dispatch({
            type: UPDATE_ITEMS,
            result: items.map(processItemFn),
          });
        }

        dispatch({
          type: LIST_DONE,
          scope,
          result: items.map((t: T) => t.id),
          all,
          partition,
          nth,
        });
      } catch (e) {
        dispatch({
          type: LIST_ERROR,
          scope,
          all,
          partition,
          nth,
        });
      }
    };
  }
  function listParallelAction(scope: Q, parallelity: number = 5) {
    return async (dispatch: ThunkDispatch<any, any, AnyAction>) => {
      return Promise.all(
        [...Array(parallelity).keys()].map(i =>
          dispatch(listAction(scope, true, parallelity, i + 1))
        )
      );
    };
  }

  const defaultListState = Object.freeze({
    fetching: false,
    done: false,
    error: false,
    ids: [],
  });

  function listReducer(state: ListStore = {}, action: ListActions): ListStore {
    return produce(state, draft => {
      switch (action.type) {
        case LIST: {
          const key = JSON.stringify({
            ...action.scope,
            cursor: undefined,
            all: action.all,
          });
          const subkey = getSubkey(action.nth, action.partition);
          if (!draft[key]) {
            draft[key] = {};
          }
          if (!draft[key][subkey]) {
            draft[key][subkey] = { ...defaultListState };
          }
          draft[key][subkey].fetching = true;
          break;
        }

        case LIST_DONE: {
          const key = JSON.stringify({
            ...action.scope,
            cursor: undefined,
            all: action.all,
          });
          const subkey = getSubkey(action.nth, action.partition);
          const ids = (action as ListDoneAction).result;
          draft[key][subkey].fetching = false;
          draft[key][subkey].done = true;
          draft[key][subkey].error = false;
          draft[key][subkey].ids = ids;
          break;
        }
        case LIST_PARTIALLY_DONE: {
          const key = JSON.stringify({
            ...action.scope,
            cursor: undefined,
            all: action.all,
          });
          const subkey = getSubkey(action.nth, action.partition);
          const ids = (action as ListDoneAction).result;
          draft[key][subkey].ids = draft[key][subkey].ids.concat(ids);
          break;
        }

        case LIST_ERROR: {
          const key = JSON.stringify({
            ...action.scope,
            cursor: undefined,
            all: action.all,
          });
          const subkey = getSubkey(action.nth, action.partition);
          draft[key][subkey].fetching = false;
          draft[key][subkey].error = true;
          break;
        }
      }
    });
  }

  function createListSelector(
    itemStoreSelector: (_: RootState) => Map<number, T>,
    listStoreSelector: (_: RootState) => Dictionary<Dictionary<ApiResult>>
  ): (_: RootState) => (q: Q, all: boolean) => Result<T> {
    const listIncludingItemsSelector = createSelector(
      itemStoreSelector,
      listStoreSelector,
      (allItems, listings) => {
        // This will create a full new set of objects, even though only
        // a subset is changed. Can be optimized, e.g with immer.
        const searchKeys = Object.keys(listings);
        return searchKeys.reduce((accl, key) => {
          const partitions = Object.values(
            listings[key] || { '1/1': { ...defaultListState } }
          );
          const ids: number[] = partitions.reduce(
            (a: number[], p: ApiResult) => a.concat(p.ids || []),
            []
          );
          const items: T[] = ids
            .map(i => allItems.get(i))
            .filter(i => !!i) as T[];
          const doneCount = partitions.filter(p => p.done).length;
          const progress = doneCount === 0 ? 0 : doneCount / partitions.length;
          const fetching = partitions.reduce(
            (a: boolean, p: ApiResult) => a || p.fetching,
            false
          );
          const done = partitions.reduce(
            (a: boolean, p: ApiResult) => a && !!p.done,
            true
          );
          const error = partitions.reduce(
            (a: boolean, p: ApiResult) => a || !!p.error,
            false
          );
          accl[key] = {
            items,
            ids,
            progress,
            done,
            error,
            fetching,
          };
          return accl;
        }, {} as { [key: string]: Result<T> });
      }
    );

    return createSelector(
      listIncludingItemsSelector,
      listings => (filter: Q, all: boolean) => {
        const key = JSON.stringify({ ...filter, all });
        return (listings[key] || {
          fetching: false,
          error: false,
          ids: [],
          items: [],
        }) as Result<T>;
      }
    );
  }

  return {
    listAction,
    listParallelAction,
    listReducer,
    createListSelector,
  };
}
