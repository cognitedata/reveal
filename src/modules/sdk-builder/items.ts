import produce from 'immer';
import { Map } from 'immutable';
import { createSelector } from 'reselect';
import { Action, AnyAction, combineReducers } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  InternalId,
  IdEither,
  ExternalId,
  CogniteInternalId,
  CogniteClient,
} from '@cognite/sdk';
import { RootState } from 'reducers';
import sdk from 'sdk-singleton';
import { Result } from './types';

export default function buildItems<
  T extends InternalId & { externalId?: string },
  U extends { id: CogniteInternalId; update: any }
>(
  type: 'functions',
  overrideRetrieveFn?: (sdk: CogniteClient) => (q: IdEither[]) => Promise<T[]>,
  deleteOldItems: boolean = false
) {
  const UPDATE_ITEMS = `${type}/UPDATE_ITEMS`;

  const RETRIEVE = `${type}/RETRIEVE`;
  const RETRIEVE_DONE = `${type}/RETRIEVE_DONE`;
  const RETRIEVE_ERROR = `${type}/RETRIEVE_ERROR`;

  const RETRIEVE_EXTERNAL = `${type}/RETRIEVE_EXTERNAL`;
  const RETRIEVE_EXTERNAL_DONE = `${type}/RETRIEVE_EXTERNAL_DONE`;
  const RETRIEVE_EXTERNAL_ERROR = `${type}/RETRIEVE_EXTERNAL_ERROR`;

  const UPDATE = `${type}/UPDATE`;
  const UPDATE_DONE = `${type}/UPDATE_DONE`;
  const UPDATE_ERROR = `${type}/UPDATE_ERROR`;

  interface UpdateItemAction extends Action<typeof UPDATE_ITEMS> {
    result: T[];
  }

  interface RetrieveAction extends Action<typeof RETRIEVE> {
    ids: IdEither[];
  }

  interface RetrieveDoneAction extends Action<typeof RETRIEVE_DONE> {
    ids: InternalId[];
    items: T[];
  }

  interface RetrieveErrorAction extends Action<typeof RETRIEVE_ERROR> {
    ids: InternalId[];
  }

  interface RetrieveExternalAction extends Action<typeof RETRIEVE_EXTERNAL> {
    ids: ExternalId[];
  }

  interface RetrieveExternalDoneAction
    extends Action<typeof RETRIEVE_EXTERNAL_DONE> {
    ids: ExternalId[];
    items: T[];
  }

  interface RetrieveExternalErrorAction
    extends Action<typeof RETRIEVE_EXTERNAL_ERROR> {
    ids: ExternalId[];
  }

  interface UpdateAction extends Action<typeof UPDATE> {
    updates: U[];
  }

  interface UpdateDoneAction extends Action<typeof UPDATE_DONE> {
    updates: U[];
  }

  interface UpdateErrorAction extends Action<typeof UPDATE_ERROR> {
    updates: U[];
  }
  type UpdateActions = UpdateAction | UpdateDoneAction | UpdateErrorAction;

  type RetrieveActions =
    | RetrieveAction
    | RetrieveDoneAction
    | RetrieveErrorAction;

  type RetrieveExternalActions =
    | RetrieveExternalAction
    | RetrieveExternalDoneAction
    | RetrieveExternalErrorAction;

  type Actions = UpdateItemAction | RetrieveAction | RetrieveExternalAction;

  interface Request {
    inProgress: boolean;
    done: boolean;
    error: boolean;
    item?: number;
  }

  interface ItemStore {
    items: Map<number, T>;
    getById: { [key: number]: Request };
    getByExternalId: { [key: string]: Request };
  }

  function getIdsToFetch(
    ids: IdEither[],
    state: { [key: string]: Request },
    forceFetch: boolean
  ) {
    if (forceFetch) {
      return ids;
    }
    return ids.filter(id => {
      // @ts-ignore
      const i = id.id || id.externalId;
      return !state[i]?.done && !state[i]?.inProgress;
    });
  }

  function buildRetrieveAction(
    startAction: string,
    doneAction: string,
    errorAction: string,
    getRequests: (state: RootState) => { [key: string]: Request }
  ) {
    return (ids: IdEither[], forceFetch = false) => {
      return async (
        dispatch: ThunkDispatch<any, any, Actions>,
        getState: () => RootState
      ) => {
        const state = getState();
        const retrieveFn = overrideRetrieveFn
          ? overrideRetrieveFn(sdk)
          : ((sdk as any)[type].retrieve as (q: IdEither[]) => Promise<T[]>);
        const requests = getRequests(state);
        ids = getIdsToFetch(ids, requests, forceFetch);
        if (ids.length === 0 && !forceFetch) {
          return;
        }

        dispatch({
          type: startAction,
          ids,
        });

        try {
          const result = await retrieveFn(ids);
          dispatch({
            type: UPDATE_ITEMS,
            result,
          });

          dispatch({
            type: doneAction,
            ids,
            items: result,
          });
        } catch (e) {
          dispatch({
            type: errorAction,
            ids,
          });
        }
      };
    };
  }

  const retrieve = buildRetrieveAction(
    RETRIEVE,
    RETRIEVE_DONE,
    RETRIEVE_ERROR,
    (state: RootState) => state.items.getById
  );
  const retrieveExternal = buildRetrieveAction(
    RETRIEVE_EXTERNAL,
    RETRIEVE_EXTERNAL_DONE,
    RETRIEVE_EXTERNAL_ERROR,
    (state: RootState) => state.items.getByExternalId
  );

  function itemReducer(
    state: Map<number, T> = Map(),
    action: UpdateItemAction
  ): Map<number, T> {
    switch (action.type) {
      case UPDATE_ITEMS: {
        const u: Iterable<[
          number,
          T
        ]> = (action as UpdateItemAction).result.map((i: T) => [i.id, i]);
        if (deleteOldItems) {
          return Map<number, T>(u);
        }
        return state.merge(u);
      }
      default: {
        return state;
      }
    }
  }

  // TODO: merge with external reducer
  function buildRetrieveReducer(
    startAction: string,
    doneAction: string,
    errorAction: string
  ) {
    return (
      state: { [key: string]: Request } = {},
      action: RetrieveActions | RetrieveExternalActions
    ): { [key: string]: Request } => {
      return produce(state, draft => {
        switch (action.type) {
          case startAction: {
            action.ids.forEach(el => {
              // @ts-ignore
              const id = el.id || el.externalId;
              draft[id] = {
                ...draft[id],
                inProgress: true,
                done: false,
                error: false,
              };
            });
            break;
          }
          case doneAction: {
            action.ids.forEach((el, i) => {
              // @ts-ignore
              const id = el.id || el.externalId;
              draft[id] = {
                ...draft[id],
                item: (action as
                  | RetrieveDoneAction
                  | RetrieveExternalDoneAction).items[i].id,
                inProgress: false,
                done: true,
                error: false,
              };
            });
            break;
          }
          case errorAction: {
            action.ids.forEach(el => {
              // @ts-ignore
              const id = el.id || el.externalId;
              draft[id] = {
                ...draft[id],
                inProgress: false,
                done: true,
                error: true,
              };
            });
            break;
          }
        }
      });
    };
  }

  function update(updates: U[]) {
    return async (dispatch: ThunkDispatch<any, any, AnyAction>) => {
      dispatch({
        type: UPDATE,
        updates,
      });
      // @ts-ignore
      const updateFn = sdk[type].update;
      try {
        const result = await updateFn(updates);
        dispatch({
          type: UPDATE_ITEMS,
          result,
        });
        dispatch({
          type: UPDATE_DONE,
          updates,
        });
      } catch (e) {
        dispatch({
          type: UPDATE_ERROR,
          updates,
        });
      }
    };
  }

  function updateReducer(
    state: { [key: number]: T } = {},
    action: UpdateActions
  ) {
    return produce(state, draft => {
      switch (action.type) {
        case UPDATE: {
          action.updates.forEach(u => {
            draft[u.id] = {
              ...draft[u.id],
              inProgress: true,
            };
          });
          break;
        }
        case UPDATE_DONE: {
          action.updates.forEach(u => {
            draft[u.id] = {
              ...draft[u.id],
              inProgress: false,
              done: true,
            };
          });
          break;
        }
        case UPDATE_ERROR: {
          action.updates.forEach(u => {
            draft[u.id] = {
              ...draft[u.id],
              inProgress: false,
              error: true,
            };
          });
          break;
        }
      }
    });
  }

  const reducer = combineReducers({
    items: itemReducer,
    update: updateReducer,
    getById: buildRetrieveReducer(RETRIEVE, RETRIEVE_DONE, RETRIEVE_ERROR),
    getByExternalId: buildRetrieveReducer(
      RETRIEVE_EXTERNAL,
      RETRIEVE_EXTERNAL_DONE,
      RETRIEVE_EXTERNAL_ERROR
    ),
  });

  function createItemSelector(
    itemsSelector: (_: RootState) => Map<number, T>,
    getByExternalId: (_: RootState) => { [key: string]: Request }
  ): (_: RootState) => (id: number | string | undefined) => T | undefined {
    return createSelector(
      itemsSelector,
      getByExternalId,
      (items, byExternalId) => (id: number | string | undefined) => {
        if (typeof id === 'number') {
          return items.get(id);
        }
        if (typeof id === 'string') {
          const request = byExternalId[id];
          const itemId = request?.item;
          return itemId ? items.get(itemId) : undefined;
        }
        return undefined;
      }
    );
  }

  function createExternalIdMapSelector(
    itemStoreSelector: (_: RootState) => ItemStore
  ) {
    return createSelector(itemStoreSelector, itemStore => {
      const { items, getByExternalId } = itemStore;
      return Object.keys(getByExternalId).reduce((accl, key) => {
        const itemId: number | undefined = getByExternalId[key]?.item;
        const item = itemId && items.get(itemId);
        if (item) {
          accl[key] = item;
        }
        return accl;
      }, {} as { [key: string]: T });
    });
  }

  function createRetrieveSelector(
    itemsSelector: (_: RootState) => Map<number, T>,
    requestSelector: (_: RootState) => { [key: number]: Request }
  ): (_: RootState) => (ids: InternalId[]) => Result<T> {
    return createSelector(
      itemsSelector,
      requestSelector,
      (allItems, allRequests) => (ids: InternalId[]) => {
        const requests = ids.map(({ id }) => allRequests[id]);
        const items: T[] = ids
          .map(i => allItems.get(i.id))
          .filter(i => !!i) as T[];
        const doneCount = requests.filter(r => r?.done).length;
        const progress = doneCount === 0 ? 0 : doneCount / ids.length;
        const fetching = requests.reduce(
          (accl, r) => !!(accl || r?.inProgress),
          false
        );
        const done = progress === 1;
        return {
          progress,
          fetching,
          done,
          error: false,
          items,
        } as Result<T>;
      }
    );
  }

  return {
    itemReducer: reducer,
    retrieve,
    update,
    retrieveExternal,
    createExternalIdMapSelector,
    createItemSelector,
    createRetrieveSelector,
  };
}
