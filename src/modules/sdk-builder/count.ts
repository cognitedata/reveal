import produce from 'immer';
import { createSelector } from 'reselect';
import { Action } from 'redux';
import { RootState } from 'reducers/';
import { ThunkDispatch } from 'redux-thunk';
import sdk from 'sdk-singleton';
import { Query, ResourceType, ApiCall } from './types';

export default function buildCount<Q extends Query>(type: ResourceType) {
  const COUNT = `${type}/COUNT`;
  const COUNT_DONE = `${type}/COUNT_DONE`;
  const COUNT_ERROR = `${type}/COUNT_ERROR`;

  interface ApiCountResult extends ApiCall {
    count?: number;
  }

  interface CountAction extends Action<typeof COUNT> {
    scope: Q;
  }

  interface CountDoneAction extends Action<typeof COUNT_DONE> {
    scope: Q;
    count: number;
  }

  interface CountErrorAction extends Action<typeof COUNT_ERROR> {
    scope: Q;
  }
  type CountActions = CountAction | CountDoneAction | CountErrorAction;

  function countAction(filter: Q) {
    return async (dispatch: ThunkDispatch<any, any, CountActions>) => {
      dispatch({
        type: COUNT,
        scope: filter,
      });

      try {
        const {
          data: {
            items: [{ count: aggregateCount }],
          },
        } = await sdk.post(
          `/api/v1/projects/${sdk.project}/${type}/aggregate`,
          {
            data: { filter: filter.filter || {} },
          }
        );

        dispatch({
          type: COUNT_DONE,
          scope: filter,
          count: aggregateCount,
        });
      } catch (error) {
        dispatch({
          type: COUNT_ERROR,
          scope: filter,
        });
      }
    };
  }

  interface CountStore {
    [key: string]: ApiCountResult;
  }

  const defaultState: ApiCountResult = {
    fetching: false,
    error: false,
    done: false,
  };

  function countReducer(state: CountStore = {}, action: CountActions) {
    return produce(state, draft => {
      switch (action.type) {
        case COUNT: {
          const key = JSON.stringify(action.scope);
          if (!draft[key]) {
            draft[key] = { ...defaultState };
          }
          draft[key].fetching = true;
          break;
        }

        case COUNT_DONE: {
          const key = JSON.stringify(action.scope);
          draft[key].done = true;
          draft[key].error = false;
          draft[key].fetching = false;
          // TODO: figure out why TS isn't happy with count not being
          // in all actions (or whatever is causing this issue).
          draft[key].count = (action as CountDoneAction).count;
          break;
        }

        case COUNT_ERROR: {
          const key = JSON.stringify(action.scope);
          draft[key].error = true;
          draft[key].fetching = false;
          break;
        }
      }
    }) as CountStore;
  }

  const defaultCount = Object.freeze({
    fetching: false,
    error: false,
    done: false,
    count: 0,
  });

  function createCountSelector(
    countSelector: (_: RootState) => CountStore
  ): (_: RootState) => (q: Q) => ApiCountResult {
    return createSelector(countSelector, counts => (q: Q) => {
      const key = JSON.stringify(q);
      return (counts[key] || defaultCount) as ApiCountResult;
    });
  }

  return {
    countAction,
    countReducer,
    createCountSelector,
  };
}
