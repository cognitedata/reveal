import produce from 'immer';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from 'reducers/index';
import { Function, Call, Log } from 'types/Types';
import set from 'lodash/set';
import { trackTimedUsage } from 'utils/Metrics';
import sdk from 'sdk-singleton';

const LIST_CALLS = 'functions/LIST_CALLS';
const LIST_CALLS_DONE = 'functions/LIST_CALLS_DONE';
const LIST_CALLS_ERROR = 'functions/LIST_CALLS_ERROR';
const RETRIEVE_LOGS = 'functions/RETRIEVE_LOGS';
const RETRIEVE_LOGS_DONE = 'functions/RETRIEVE_LOGS_DONE';
const RETRIEVE_LOGS_ERROR = 'functions/RETRIEVE_LOGS_ERROR';

interface ListCallsAction extends Action<typeof LIST_CALLS> {
  functionId: number;
}

interface ListCallsDoneAction extends Action<typeof LIST_CALLS_DONE> {
  calls: Call[];
  functionId: number;
}

interface ListCallsErrorAction extends Action<typeof LIST_CALLS_ERROR> {
  functionId: number;
}

interface RetrieveLogsAction extends Action<typeof RETRIEVE_LOGS> {
  functionId: number;
  callId: number;
}

interface RetrieveLogsDoneAction extends Action<typeof RETRIEVE_LOGS_DONE> {
  functionId: number;
  callId: number;
  logs: Log[];
}

interface RetrieveLogsErrorAction extends Action<typeof RETRIEVE_LOGS_ERROR> {
  functionId: number;
  callId: number;
}

type ListCallsActions =
  | ListCallsAction
  | ListCallsDoneAction
  | ListCallsErrorAction;

type RetrieveLogsActions =
  | RetrieveLogsAction
  | RetrieveLogsDoneAction
  | RetrieveLogsErrorAction;

export const retrieveLogs = (functionId: number, callId: number) => async (
  dispatch: ThunkDispatch<any, any, RetrieveLogsActions>
) => {
  dispatch({
    type: RETRIEVE_LOGS,
    functionId,
    callId,
  });
  const timer = trackTimedUsage('Functions.RetrieveLogs', {
    function: functionId,
    call: callId,
  });

  try {
    const response = await sdk.get(
      `/api/playground/projects/${sdk.project}/functions/${functionId}/calls/${callId}/logs`
    );
    if (response.status !== 200) {
      dispatch({
        type: RETRIEVE_LOGS_ERROR,
        functionId,
        callId,
      });
      timer.stop({ success: false });
      return;
    }
    dispatch({
      type: RETRIEVE_LOGS_DONE,
      functionId,
      callId,
      logs: response.data.items as Log[],
    });

    timer.stop({ success: true });
  } catch (e) {
    dispatch({
      type: RETRIEVE_LOGS_ERROR,
      functionId,
      callId,
    });
    timer.stop({ success: false });
  }
};

export const getFunctionCalls = (functionId: number) => async (
  dispatch: ThunkDispatch<any, any, ListCallsActions>
) => {
  dispatch({
    type: LIST_CALLS,
    functionId,
  });
  const timer = trackTimedUsage('Functions.RetrieveCalls', {
    function: functionId,
  });

  try {
    const response = await sdk.get(
      `/api/playground/projects/${sdk.project}/functions/${functionId}/calls`
    );
    if (response.status !== 200) {
      dispatch({
        type: LIST_CALLS_ERROR,
        functionId,
      });
      timer.stop({ success: false });
      return;
    }
    dispatch({
      type: LIST_CALLS_DONE,
      functionId,
      calls: response.data.items as Call[],
    });

    timer.stop({ success: true });
  } catch (e) {
    dispatch({
      type: LIST_CALLS_ERROR,
      functionId,
    });
    timer.stop({ success: false });
  }
};

export const getFunctionsCalls = (functions?: Function[]) => async (
  dispatch: ThunkDispatch<any, any, ListCallsActions>,
  getState: () => RootState
) => {
  let allFunctions: Function[];
  try {
    if (functions) {
      allFunctions = functions;
    } else {
      allFunctions = getState().items.items.valueSeq().toJS();
    }
  } catch (e) {
    allFunctions = [];
  }
  allFunctions.forEach(async (f: Function) => {
    await dispatch(getFunctionCalls(f.id));
  });
};

interface Logs {
  [callId: number]: {
    logs?: Log[];
    fetching?: boolean;
    error?: boolean;
  };
}

interface CallsStore {
  [id: number]: {
    functionCalls?: Call[];
    fetching?: boolean;
    error?: boolean;
    logs: Logs;
  };
}
const defaultCallsStore = {};

export default function reducer(
  state: CallsStore = defaultCallsStore,
  action: ListCallsActions | RetrieveLogsActions
): CallsStore {
  return produce(state, draft => {
    switch (action.type) {
      case LIST_CALLS: {
        set(draft, [action.functionId, 'fetching'], true);
        set(draft, [action.functionId, 'logs'], {});
        break;
      }
      case LIST_CALLS_DONE: {
        set(draft, [action.functionId, 'fetching'], false);
        set(draft, [action.functionId, 'error'], false);
        set(
          draft,
          [action.functionId, 'functionCalls'],
          action.calls.sort((a: Call, b: Call) => {
            if (a.startTime > b.startTime) {
              return -1;
            }
            if (a.startTime < b.startTime) {
              return 1;
            }
            return 0;
          })
        );
        break;
      }
      case LIST_CALLS_ERROR: {
        set(draft, [action.functionId, 'fetching'], false);
        set(draft, [action.functionId, 'error'], true);
        break;
      }
      case RETRIEVE_LOGS: {
        set(draft[action.functionId].logs, [action.callId, 'fetching'], true);
        break;
      }
      case RETRIEVE_LOGS_DONE: {
        set(draft[action.functionId].logs!, [action.callId, 'fetching'], false);
        set(draft[action.functionId].logs!, [action.callId, 'error'], false);
        set(
          draft[action.functionId].logs!,
          [action.callId, 'logs'],
          action.logs
        );
        break;
      }
      case RETRIEVE_LOGS_ERROR: {
        set(draft[action.functionId].logs!, [action.callId, 'fetching'], false);
        set(draft[action.functionId].logs!, [action.callId, 'error'], true);
        break;
      }
    }
  });
}

export const selectFunctionCalls = (functionId: number) => (
  state: RootState
) => {
  try {
    const { functionCalls, error } = state.allCalls[functionId];
    return { functionCalls, error };
  } catch {
    return {};
  }
};
export const selectFunctionCallLogs = (functionId: number, callId: number) => (
  state: RootState
) => {
  try {
    return state.allCalls[functionId].logs![callId];
  } catch {
    return {};
  }
};
