import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from 'reducers/index';
import { Function, CallResponse, Call } from 'types/Types';
import { trackTimedUsage } from 'utils/Metrics';
import { createSelector } from 'reselect';
import sdk from 'sdk-singleton';

const RESPONSE = 'functions/RESPONSE';
const RESPONSE_DONE = 'functions/RESPONSE_DONE';
const RESPONSE_ERROR = 'functions/RESPONSE_ERROR';

interface ResponseAction extends Action<typeof RESPONSE> {
  func: Function;
  callId: number;
}

interface ResponseDoneAction extends Action<typeof RESPONSE_DONE> {
  func: Function;
  callId: number;
  result: any;
}

interface ResponseErrorAction extends Action<typeof RESPONSE_ERROR> {
  func: Function;
  callId: number;
}

type ResponseActions =
  | ResponseAction
  | ResponseDoneAction
  | ResponseErrorAction;

export const retrieveFunctionResponse = (
  func: Function,
  callId: number,
  forceRefresh = false
) => async (
  dispatch: ThunkDispatch<any, any, ResponseActions>,
  getState: () => RootState
) => {
  const currentResponse = responseSelector(getState())(func.externalId, callId);
  if (currentResponse && currentResponse.response && !forceRefresh) {
    return;
  }
  dispatch({
    type: RESPONSE,
    callId,
    func,
  });

  const timer = trackTimedUsage('Functions.LoadResponse', {
    name: func.name,
    externalId: func.externalId,
    callId,
  });

  try {
    const { data: responseData } = await sdk.get<CallResponse>(
      `/api/playground/projects/${sdk.project}/functions/${func.id}/calls/${callId}/response`
    );
    dispatch({
      type: RESPONSE_DONE,
      callId,
      result: responseData.response,
      func,
    });

    timer.stop({ success: true });
  } catch (e) {
    dispatch({
      type: RESPONSE_ERROR,
      callId,
      func,
    });

    timer.stop({ success: false });
  }
};

export const retrieveFunctionResponses = (
  func: Function,
  forceRefresh = false
) => async (
  dispatch: ThunkDispatch<any, any, AnyAction>,
  getState: () => RootState
) => {
  const calls = getState().allCalls[func.id].functionCalls || [];
  calls.forEach(async (c: Call) => {
    const currentResponse = responseSelector(getState())(func.externalId, c.id);
    if (forceRefresh || !currentResponse || !currentResponse.response) {
      await dispatch(retrieveFunctionResponse(func, c.id, forceRefresh));
    }
  });
};

interface ResponseFunctionStore {
  [key: string]: {
    [key: number]: { done: boolean; response?: any; error: boolean };
  };
}
const defaultResponseFunctionStore = {};

export default function reducer(
  state: ResponseFunctionStore = defaultResponseFunctionStore,
  action: ResponseActions
): ResponseFunctionStore {
  switch (action.type) {
    case RESPONSE: {
      return {
        ...state,
        [action.func.externalId]: {
          ...state[action.func.externalId],
          [action.callId]: {
            done: false,
            error: false,
          },
        },
      };
    }
    case RESPONSE_DONE: {
      return {
        ...state,
        [action.func.externalId]: {
          ...state[action.func.externalId],
          [action.callId]: {
            done: true,
            response: action.result,
            error: false,
          },
        },
      };
    }
    case RESPONSE_ERROR: {
      return {
        ...state,
        [action.func.externalId]: {
          ...state[action.func.externalId],
          [action.callId]: {
            done: true,
            error: true,
          },
        },
      };
    }
    default:
      return state;
  }
}

export const responsesSelector = createSelector(
  (state: RootState) => state.response,
  responseStore => (funcId?: string) => {
    if (!funcId) {
      return {};
    }
    return responseStore[funcId] || {};
  }
);

export const responseSelector = createSelector(
  (state: RootState) => state.response,
  responseStore => (funcId: string, callId: number) => {
    return (responseStore[funcId] || {})[callId];
  }
);
