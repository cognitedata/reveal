import produce from 'immer';
import { Action } from 'redux';
import { createSelector } from 'reselect';
import { ThunkDispatch } from 'redux-thunk';

import { InternalId } from '@cognite/sdk';
import sdk from 'sdk-singleton';
import { RootState } from 'reducers/';
import { Dictionary } from 'lodash';
import { ResourceType, ApiResult, Result, Query } from './types';

export default function buildSearch<T extends InternalId, Q extends Query>(
  type: ResourceType,
  processItem: (t: T) => T = (t: T) => t
) {
  const SEARCH = `${type}/SEARCH`;
  const SEARCH_DONE = `${type}/SEARCH_DONE`;
  const SEARCH_ERROR = `${type}/SEARCH_ERROR`;
  const UPDATE_ITEMS = `${type}/UPDATE_ITEMS`;

  interface SearchStore {
    [key: string]: ApiResult;
  }

  interface SearchAction extends Action<typeof SEARCH> {
    filter: Q;
  }

  interface SearchDoneAction extends Action<typeof SEARCH_DONE> {
    filter: Q;
    result: T[];
  }

  interface SearchErrorAction extends Action<typeof SEARCH_ERROR> {
    filter: Q;
  }
  interface UpdateItemsAction extends Action<typeof UPDATE_ITEMS> {
    result: T[];
  }

  type SearchActions = SearchAction | SearchDoneAction | SearchErrorAction;
  type AllActions = SearchAction | UpdateItemsAction;

  function searchAction(filter: Q) {
    return async (dispatch: ThunkDispatch<RootState, any, AllActions>) => {
      dispatch({
        type: SEARCH,
        filter,
      });
      try {
        // @ts-ignore
        const searchFn: (q: Q) => Promise<T[]> = sdk[type].search;
        const result: T[] = (await searchFn(filter)) as T[];

        dispatch({
          type: UPDATE_ITEMS,
          result: result.map(processItem),
        });
        dispatch({
          type: SEARCH_DONE,
          filter,
          result,
        });
      } catch (e) {
        dispatch({
          type: SEARCH_ERROR,
          filter,
        });
      }
    };
  }

  function createSearchSelector(
    itemStoreSelector: (_: RootState) => Map<number, T>,
    searchStoreSelector: (_: RootState) => Dictionary<ApiResult>
  ): (_: RootState) => (q: Q) => Result<T> {
    const searchIncludingItemsSelector = createSelector(
      itemStoreSelector,
      searchStoreSelector,
      (items, searches) => {
        // This will create a full new set of objects, even though only
        // a subset is changed. Can be optimized, e.g with immer.
        const searchKeys = Object.keys(searches);
        return searchKeys.reduce((accl, key) => {
          accl[key] = {
            ...searches[key],
            items: (searches[key].ids || [])
              .map(i => {
                return items.get(i);
              })
              .filter(i => !!i) as T[],
            progress: searches[key].done ? 1 : 0,
          };
          return accl;
        }, {} as { [key: string]: Result<T> });
      }
    );

    return createSelector(
      searchIncludingItemsSelector,
      searches => (filter: Q) => {
        const key = JSON.stringify(filter);
        return (searches[key] || {
          fetching: false,
          error: false,
          ids: [],
          items: [],
        }) as Result<T>;
      }
    );
  }

  const defaultSearchState: ApiResult = Object.freeze({
    fetching: false,
    done: false,
    error: false,
    ids: [],
  });

  function searchReducer(
    state: SearchStore = {},
    action: SearchActions
  ): SearchStore {
    return produce(state, draft => {
      switch (action.type) {
        case SEARCH: {
          const key = JSON.stringify(action.filter);
          if (!draft[key]) {
            draft[key] = { ...defaultSearchState };
          }
          draft[key].fetching = true;
          break;
        }

        case SEARCH_DONE: {
          const key = JSON.stringify(action.filter);
          const ids = (action as SearchDoneAction).result.map(t => t.id);

          draft[key].fetching = false;
          draft[key].error = false;
          draft[key].ids = ids;
          draft[key].done = true;
          break;
        }

        case SEARCH_ERROR: {
          const key = JSON.stringify(action.filter);
          draft[key].fetching = false;
          draft[key].error = true;
          break;
        }
      }
    });
  }

  return {
    searchAction,
    createSearchSelector,
    searchReducer,
  };
}
