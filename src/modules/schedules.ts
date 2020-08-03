import produce from 'immer';
import { Action, combineReducers } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from 'reducers/index';
import { Function, Schedule, Call } from 'types/Types';
import { trackTimedUsage } from 'utils/Metrics';
import sdk from 'sdk-singleton';

const SCHEDULES_LIST = 'functions/SCHEDULES_LIST';
const SCHEDULES_LIST_DONE = 'functions/SCHEDULES_LIST_DONE';
const SCHEDULES_LIST_ERROR = 'functions/SCHEDULES_LIST_ERROR';
const SCHEDULE_LIST_CALLS = 'functions/SCHEDULE_LIST_CALLS';
const SCHEDULE_LIST_CALLS_DONE = 'functions/SCHEDULE_LIST_CALLS_DONE';
const SCHEDULE_LIST_CALLS_ERROR = 'functions/SCHEDULE_LIST_CALLS_ERROR';
const SCHEDULE_CREATE = 'functions/SCHEDULE_CREATE';
const SCHEDULE_CREATE_DONE = 'functions/SCHEDULE_CREATE_DONE';
const SCHEDULE_CREATE_ERROR = 'functions/SCHEDULE_CREATE_ERROR';
const SCHEDULE_CREATE_RESET = 'functions/SCHEDULE_CREATE_RESET';
const SCHEDULE_DELETE = 'functions/SCHEDULE_DELETE';
const SCHEDULE_DELETE_DONE = 'functions/SCHEDULE_DELETE_DONE';
const SCHEDULE_DELETE_ERROR = 'functions/SCHEDULE_DELETE_ERROR';

interface ListSchedulesAction extends Action<typeof SCHEDULES_LIST> {}

interface ListSchedulesDoneAction extends Action<typeof SCHEDULES_LIST_DONE> {
  schedules: Schedule[];
}

interface ListSchedulesErrorAction
  extends Action<typeof SCHEDULES_LIST_ERROR> {}

interface ListScheduleCallsAction extends Action<typeof SCHEDULE_LIST_CALLS> {
  schedule: Schedule;
}

interface ListScheduleCallsDoneAction
  extends Action<typeof SCHEDULE_LIST_CALLS_DONE> {
  schedule: Schedule;
  calls: Call[];
}

interface ListScheduleCallsErrorAction
  extends Action<typeof SCHEDULE_LIST_CALLS_ERROR> {
  schedule: Schedule;
}

interface CreateScheduleAction extends Action<typeof SCHEDULE_CREATE> {
  scheduleName: string;
  description: string;
  cronExpression: string;
  data: object;
  functionExternalId: string;
}

interface CreateScheduleDoneAction extends Action<typeof SCHEDULE_CREATE_DONE> {
  scheduleName: string;
  functionExternalId: string;
}

interface CreateScheduleErrorAction
  extends Action<typeof SCHEDULE_CREATE_ERROR> {
  scheduleName: string;
  functionExternalId: string;
  errorMessage: string;
}

interface CreateScheduleResetAction
  extends Action<typeof SCHEDULE_CREATE_RESET> {}

interface DeleteScheduleAction extends Action<typeof SCHEDULE_DELETE> {
  scheduleToDelete: Schedule;
  functionExternalId: string;
}

interface DeleteScheduleDoneAction extends Action<typeof SCHEDULE_DELETE_DONE> {
  scheduleToDelete: Schedule;
  functionExternalId: string;
}

interface DeleteScheduleErrorAction
  extends Action<typeof SCHEDULE_DELETE_ERROR> {
  scheduleToDelete: Schedule;
  functionExternalId: string;
}

type ListSchedulesActions =
  | ListSchedulesAction
  | ListSchedulesDoneAction
  | ListSchedulesErrorAction;

type ListScheduleCallsActions =
  | ListScheduleCallsAction
  | ListScheduleCallsDoneAction
  | ListScheduleCallsErrorAction;

type CreateScheduleActions =
  | CreateScheduleAction
  | CreateScheduleDoneAction
  | CreateScheduleErrorAction
  | CreateScheduleResetAction;

type DeleteScheduleActions =
  | DeleteScheduleAction
  | DeleteScheduleDoneAction
  | DeleteScheduleErrorAction;

export const loadSchedules = () => async (
  dispatch: ThunkDispatch<any, any, ListSchedulesActions>
) => {
  dispatch({
    type: SCHEDULES_LIST,
  });
  try {
    const response = await sdk.get(
      `/api/playground/projects/${sdk.project}/functions/schedules`
    );
    if (response.status !== 200) {
      dispatch({
        type: SCHEDULES_LIST_ERROR,
      });
      return;
    }
    dispatch({
      type: SCHEDULES_LIST_DONE,
      schedules: response.data.items as Schedule[],
    });
  } catch (e) {
    dispatch({
      type: SCHEDULES_LIST_ERROR,
    });
  }
};

export const loadScheduleCalls = (
  schedule: Schedule,
  functionId: number
) => async (dispatch: ThunkDispatch<any, any, ListScheduleCallsActions>) => {
  dispatch({
    type: SCHEDULE_LIST_CALLS,
    schedule,
  });
  try {
    const response = await sdk.post(
      `/api/playground/projects/${sdk.project}/functions/${functionId}/calls/list`,
      {
        data: {
          filter: {
            scheduleId: schedule.id,
          },
        },
      }
    );
    if (response.status !== 200) {
      dispatch({
        type: SCHEDULE_LIST_CALLS_ERROR,
        schedule,
      });
      return;
    }
    dispatch({
      type: SCHEDULE_LIST_CALLS_DONE,
      schedule,
      calls: response.data.items as Call[],
    });
  } catch (e) {
    dispatch({
      type: SCHEDULE_LIST_CALLS_ERROR,
      schedule,
    });
  }
};

export const getSchedulesCalls = () => async (
  dispatch: ThunkDispatch<any, any, ListScheduleCallsActions>,
  getState: () => RootState
) => {
  let allFunctions: Function[];
  let allSchedules: Schedule[];
  try {
    allFunctions = getState().items.items.valueSeq().toJS();
    allSchedules = Object.values(getState().schedules.list.items)
      .map(o => o.schedule)
      .filter((s: Schedule) => !!s);
  } catch (e) {
    allFunctions = [];
    allSchedules = [];
  }

  allSchedules.forEach(async (s: Schedule) => {
    const matchingFunction = allFunctions.find(
      (f: Function) => f.externalId === s.functionExternalId
    );
    if (matchingFunction) {
      await dispatch(loadScheduleCalls(s, matchingFunction.id));
    }
  });
};

export const createSchedule = (
  scheduleName: string,
  description: string,
  cronExpression: string,
  data: object,
  functionExternalId: string
) => async (dispatch: ThunkDispatch<any, any, CreateScheduleActions>) => {
  if (!functionExternalId) {
    dispatch({
      type: SCHEDULE_CREATE_ERROR,
      scheduleName,
      functionExternalId,
      errorMessage: 'The function does not have an external id',
    });
    return;
  }
  dispatch({
    type: SCHEDULE_CREATE,
    scheduleName,
    description,
    cronExpression,
    data,
    functionExternalId,
  });
  const timer = trackTimedUsage('Schedules.Create', {
    name: scheduleName,
    externalId: functionExternalId,
    cronExpression,
    hasDescription: !!description,
    hasData: !!data,
  });

  try {
    const response = await sdk.post(
      `/api/playground/projects/${sdk.project}/functions/schedules`,
      {
        data: {
          items: [
            {
              name: scheduleName,
              functionExternalId,
              description,
              cronExpression,
              data,
            },
          ],
        },
      }
    );
    if (response.status !== 201) {
      dispatch({
        type: SCHEDULE_CREATE_ERROR,
        scheduleName,
        functionExternalId,
        errorMessage: 'Unable to create schedule',
      });
      timer.stop({ success: false });
      return;
    }
    // update store
    dispatch(loadSchedules());

    dispatch({
      type: SCHEDULE_CREATE_DONE,
      scheduleName,
      functionExternalId,
    });

    timer.stop({ success: true });
  } catch (e) {
    dispatch({
      type: SCHEDULE_CREATE_ERROR,
      scheduleName,
      functionExternalId,
      errorMessage: e.message,
    });
    timer.stop({ success: false });
  }
};

export const createScheduleReset = () => async (
  dispatch: ThunkDispatch<any, any, CreateScheduleActions>
) => {
  dispatch({
    type: SCHEDULE_CREATE_RESET,
  });
};

export function deleteSchedule(scheduleToDelete: Schedule) {
  return async (dispatch: ThunkDispatch<any, any, DeleteScheduleActions>) => {
    dispatch({
      type: SCHEDULE_DELETE,
      scheduleToDelete,
      functionExternalId: scheduleToDelete.functionExternalId,
    });
    const timer = trackTimedUsage('Schedules.Delete', {
      name: scheduleToDelete.name,
      externalId: scheduleToDelete.functionExternalId,
    });

    try {
      const response = await sdk.post(
        `/api/playground/projects/${sdk.project}/functions/schedules/delete`,
        {
          data: { items: [{ id: scheduleToDelete.id }] },
        }
      );
      if (response.status !== 200) {
        dispatch({
          type: SCHEDULE_DELETE_ERROR,
          scheduleToDelete,
          functionExternalId: scheduleToDelete.functionExternalId,
        });
        timer.stop({ success: false });
        return;
      }

      // update store
      await dispatch(loadSchedules());

      dispatch({
        type: SCHEDULE_DELETE_DONE,
        scheduleToDelete,
        functionExternalId: scheduleToDelete.functionExternalId,
      });

      timer.stop({ success: true });
    } catch (e) {
      dispatch({
        type: SCHEDULE_DELETE_ERROR,
        scheduleToDelete,
        functionExternalId: scheduleToDelete.functionExternalId,
      });
      timer.stop({ success: false });
    }
  };
}

export interface ScheduleWithCalls {
  schedule: Schedule;
  calls?: Call[];
}

interface ListSchedulesStore {
  fetching?: boolean;
  error?: boolean;
  items: { [id: number]: ScheduleWithCalls };
}
const defaultSchedulesStore = { items: {} };

function listSchedulesReducer(
  state: ListSchedulesStore = defaultSchedulesStore,
  action: ListSchedulesActions | ListScheduleCallsActions
): ListSchedulesStore {
  return produce(state, draft => {
    switch (action.type) {
      case SCHEDULES_LIST: {
        draft.fetching = true;
        break;
      }
      case SCHEDULES_LIST_DONE: {
        draft.fetching = false;
        draft.error = false;
        draft.items = action.schedules.reduce(function reduce(
          map: { [id: number]: { schedule: Schedule } },
          s: Schedule
        ) {
          map[s.id] = { schedule: s };
          return map;
        },
        {});
        break;
      }
      case SCHEDULES_LIST_ERROR: {
        draft.fetching = false;
        draft.error = true;
        break;
      }
      case SCHEDULE_LIST_CALLS_DONE: {
        draft.items[action.schedule.id].calls = action.calls;
        break;
      }
    }
  });
}

interface CreateScheduleStore {
  name?: string;
  description?: string;
  cronExpression?: string;
  data?: object;
  functionExternalId?: string;
  creating?: boolean;
  done?: boolean;
  error?: boolean;
  errorMessage?: string;
}
const defaultCreateScheduleStore = {};

function createScheduleReducer(
  state: CreateScheduleStore = defaultCreateScheduleStore,
  action: CreateScheduleActions
): CreateScheduleStore {
  return produce(state, draft => {
    switch (action.type) {
      case SCHEDULE_CREATE: {
        draft.name = action.scheduleName;
        draft.description = action.description;
        draft.cronExpression = action.cronExpression;
        draft.functionExternalId = action.functionExternalId;
        draft.data = action.data;
        draft.creating = true;
        break;
      }
      case SCHEDULE_CREATE_DONE: {
        draft.creating = false;
        draft.done = true;
        draft.error = false;
        break;
      }
      case SCHEDULE_CREATE_ERROR: {
        draft.creating = false;
        draft.error = true;
        draft.errorMessage = action.errorMessage;
        break;
      }
      case SCHEDULE_CREATE_RESET: {
        draft.name = undefined;
        draft.description = undefined;
        draft.cronExpression = undefined;
        draft.data = undefined;
        draft.functionExternalId = undefined;
        draft.creating = true;
        draft.creating = undefined;
        draft.done = undefined;
        draft.error = undefined;
        draft.errorMessage = undefined;
        break;
      }
    }
  });
}

interface DeleteScheduleStore {
  schedule?: Schedule;
  deleting?: boolean;
  error?: boolean;
}
const defaultDeleteScheduleStore = {};

function deleteScheduleReducer(
  state: DeleteScheduleStore = defaultDeleteScheduleStore,
  action: DeleteScheduleActions
): DeleteScheduleStore {
  return produce(state, draft => {
    switch (action.type) {
      case SCHEDULE_DELETE: {
        draft.schedule = action.scheduleToDelete;
        draft.deleting = true;
        break;
      }
      case SCHEDULE_DELETE_DONE: {
        draft.deleting = false;
        draft.error = false;
        break;
      }
      case SCHEDULE_DELETE_ERROR: {
        draft.deleting = false;
        draft.error = true;
        break;
      }
    }
  });
}

export const reducer = combineReducers({
  list: listSchedulesReducer,
  create: createScheduleReducer,
  delete: deleteScheduleReducer,
});
export default reducer;

export const selectSchedulesState = (state: RootState) => {
  const {
    list: { fetching, items: schedules, error },
  } = state.schedules;
  const items = schedules
    ? Object.values(schedules)
        .map(o => o.schedule)
        .filter((s: Schedule) => !!s)
        .sort((a: Schedule, b: Schedule) => {
          if (a.createdTime > b.createdTime) {
            return -1;
          }
          if (a.createdTime < b.createdTime) {
            return 1;
          }
          return 0;
        })
    : [];
  return { items, error, fetching };
};
export const selectFunctionSchedules = (functionExternalId: string) => (
  state: RootState
) => {
  const {
    list: { items },
  } = state.schedules;
  const schedules = items
    ? Object.values(items)
        .map(o => o.schedule)
        .filter((s: Schedule) => !!s)
    : [];

  return schedules
    .filter((s: Schedule) => s.functionExternalId === functionExternalId)
    .sort((a: Schedule, b: Schedule) => {
      if (a.createdTime > b.createdTime) {
        return -1;
      }
      if (a.createdTime < b.createdTime) {
        return 1;
      }
      return 0;
    });
};
export const selectScheduleAndCalls = (functionExternalId: string) => (
  state: RootState
) => {
  const {
    list: { items },
  } = state.schedules;

  const all = Object.values(items).filter(
    (s: ScheduleWithCalls) =>
      s.schedule.functionExternalId === functionExternalId
  );
  return all;
};
export const selectCreateScheduleState = (state: RootState) => {
  const {
    create: { creating, done, error, errorMessage },
  } = state.schedules;
  return { creating, done, error, errorMessage };
};
export const selectDeleteScheduleState = (state: RootState) => {
  const {
    delete: { schedule: scheduleToDelete, deleting, error },
  } = state.schedules;
  return { scheduleToDelete, deleting, error };
};
