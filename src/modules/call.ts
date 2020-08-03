import produce from 'immer';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from 'reducers/index';
import { Function, Call } from 'types/Types';
import { trackTimedUsage } from 'utils/Metrics';
import { callUntilCompleted } from 'helpers';
import { getFunctionCalls } from 'modules/functionCalls';

import sdk from 'sdk-singleton';

const SELECT_FUNCTION_TO_CALL = 'functions/SELECT_FUNCTION_TO_CALL';
const CALL = 'functions/CALL';
const CALL_CREATED = 'functions/CALL_CREATED';
const CALL_STATUS_UPDATED = 'functions/CALL_STATUS_UPDATED';
const CALL_DONE = 'functions/CALL_DONE';
const CALL_ERROR = 'functions/CALL_ERROR';
const CALL_RESET = 'functions/CALL_RESET';

interface SelectFunctionToCall extends Action<typeof SELECT_FUNCTION_TO_CALL> {
  functionToCall: Function;
}

interface CallAction extends Action<typeof CALL> {
  functionToCall: Function;
  data: object;
}

interface CallCreatedAction extends Action<typeof CALL_CREATED> {
  functionToCall: Function;
  callId: number;
  result: Call;
}

interface CallStatusUpdatedAction extends Action<typeof CALL_STATUS_UPDATED> {
  functionToCall: Function;
  status: string;
  result: Call;
}

interface CallDoneAction extends Action<typeof CALL_DONE> {
  functionToCall: Function;
  result: Call;
}

interface CallErrorAction extends Action<typeof CALL_ERROR> {
  functionToCall: Function;
  result: Call;
}

interface CallResetAction extends Action<typeof CALL_RESET> {}

type CallActions =
  | SelectFunctionToCall
  | CallAction
  | CallCreatedAction
  | CallStatusUpdatedAction
  | CallDoneAction
  | CallErrorAction
  | CallResetAction;

export const storeFunctionToCall = (functionToCall: Function) => async (
  dispatch: ThunkDispatch<any, any, CallActions>
) => {
  dispatch({
    type: SELECT_FUNCTION_TO_CALL,
    functionToCall,
  });
};

export const callFunction = (
  functionToCall: Function,
  input?: object
) => async (
  dispatch: ThunkDispatch<any, any, CallActions>,
  getState: () => RootState
) => {
  dispatch({
    type: CALL,
    data: input || {},
    functionToCall,
  });

  const inputData = input ? { data: input } : {};
  const timer = trackTimedUsage('Functions.AsyncCall', {
    name: functionToCall.name,
    externalId: functionToCall.externalId,
    hasData: !!input,
  });

  try {
    await sdk
      .post(
        `/api/playground/projects/${sdk.project}/functions/${functionToCall.id}/call`,
        {
          data: inputData,
        }
      )
      .then(response => {
        const {
          status: httpStatus,
          data: { id: callId },
        } = response;

        if (httpStatus === 201) {
          dispatch({
            type: CALL_CREATED,
            functionToCall,
            callId,
            result: response.data,
          });

          callUntilCompleted(
            () =>
              sdk.get(
                `/api/playground/projects/${sdk.project}/functions/${functionToCall.id}/calls/${callId}`
              ),
            data => {
              return (
                ['Completed', 'Failed', 'Timeout'].includes(data.status) ||
                // if the user closed the modal, do not continue fetching call status
                (getState().call.function !== functionToCall &&
                  getState().call.currentCallId !== callId)
              );
            },
            async data => {
              // if the user closed the modal, do not update the call response
              if (
                getState().call.function === functionToCall &&
                getState().call.currentCallId === callId
              ) {
                if (data.status === 'Failed' || data.status === 'Timeout') {
                  dispatch({
                    type: CALL_ERROR,
                    result: data || {},
                    functionToCall,
                  });

                  timer.stop({ success: false });
                } else if (data.status === 'Completed') {
                  dispatch({
                    type: CALL_DONE,
                    result: data || {},
                    functionToCall,
                  });

                  timer.stop({ success: true });
                }
                // update store
                dispatch(getFunctionCalls(functionToCall.id));
              }
            },
            data => {
              if (
                getState().call.function === functionToCall &&
                getState().call.currentCallId === callId
              ) {
                dispatch({
                  type: CALL_STATUS_UPDATED,
                  functionToCall,
                  status: data.status,
                  result: data,
                });
              }
            },
            () => {
              dispatch({
                type: CALL_ERROR,
                result: response.data || {},
                functionToCall,
              });

              timer.stop({ success: false });
            }
          );
        } else {
          dispatch({
            type: CALL_ERROR,
            result: response.data || {},
            functionToCall,
          });

          timer.stop({ success: false });
        }
      });
  } catch (e) {
    dispatch({
      type: CALL_ERROR,
      result: {} as Call,
      functionToCall,
    });

    timer.stop({ success: false });
  }
  // update store
  dispatch(getFunctionCalls(functionToCall.id));
};

export const callFunctionReset = () => async (
  dispatch: ThunkDispatch<any, any, CallActions>
) => {
  dispatch({
    type: CALL_RESET,
  });
};

interface CallFunctionStore {
  function?: Function;
  input?: object;
  creating?: boolean;
  currentCallId?: number;
  calling?: boolean;
  error?: boolean;
  result?: Call;
}
const defaultCallFunctionStore = {};

export default function reducer(
  state: CallFunctionStore = defaultCallFunctionStore,
  action: CallActions
): CallFunctionStore {
  return produce(state, draft => {
    switch (action.type) {
      case SELECT_FUNCTION_TO_CALL: {
        draft.function = action.functionToCall;
        break;
      }
      case CALL: {
        draft.creating = true;
        draft.calling = true;
        draft.currentCallId = undefined;
        draft.input = action.data;
        break;
      }
      case CALL_CREATED: {
        draft.creating = false;
        draft.calling = true;
        draft.currentCallId = action.callId;
        draft.result = action.result;
        break;
      }
      case CALL_STATUS_UPDATED: {
        draft.creating = false;
        draft.calling = true;
        draft.result = action.result;
        break;
      }
      case CALL_DONE: {
        draft.creating = false;
        draft.calling = false;
        draft.error = false;
        draft.result = action.result;
        break;
      }
      case CALL_ERROR: {
        draft.creating = false;
        draft.calling = false;
        draft.error = true;
        draft.result = action.result;
        break;
      }
      case CALL_RESET: {
        draft.function = undefined;
        draft.input = undefined;
        draft.creating = undefined;
        draft.currentCallId = undefined;
        draft.calling = undefined;
        draft.error = undefined;
        draft.result = undefined;
        break;
      }
    }
  });
}

export const selectFunctionToCall = (state: RootState) => {
  const func = state.call.function;
  return func;
};

export const selectCallInfo = (state: RootState) => {
  const { result, creating, calling, error } = state.call;
  return { result, creating, calling, error };
};
