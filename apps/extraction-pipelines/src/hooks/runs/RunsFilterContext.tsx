import React, { PropsWithChildren, useContext, useReducer } from 'react';
import { Range } from '@cognite/cogs.js';
import moment from 'moment';
import { RunStatus } from '@extraction-pipelines/model/Runs';

enum RUN_ACTION_TYPE {
  'UPDATE_DATE_RANGE',
  'UPDATE_SEARCH',
  'UPDATE_STATUS',
}

interface UpdateDateRange {
  type: RUN_ACTION_TYPE.UPDATE_DATE_RANGE;
  payload: Range;
}
interface UpdateSearch {
  type: RUN_ACTION_TYPE.UPDATE_SEARCH;
  payload: string;
}
interface UpdateStatus {
  type: RUN_ACTION_TYPE.UPDATE_STATUS;
  payload: RunStatus[];
}

type UpdateActions = UpdateDateRange | UpdateSearch | UpdateStatus;

export const updateSearchAction = (
  payload: UpdateSearch['payload']
): UpdateSearch => {
  return { type: RUN_ACTION_TYPE.UPDATE_SEARCH, payload };
};

export const updateStatusAction = (
  payload: UpdateStatus['payload']
): UpdateStatus => {
  return { type: RUN_ACTION_TYPE.UPDATE_STATUS, payload };
};

export const updateDateRangeAction = (
  payload: UpdateDateRange['payload']
): UpdateDateRange => {
  return { type: RUN_ACTION_TYPE.UPDATE_DATE_RANGE, payload };
};

interface StateType {
  dateRange: Range;
  statuses: RunStatus[];
  search: string;
}

type ContextActions = UpdateActions;

interface ExtpipeContextType {
  state: StateType;
  dispatch: React.Dispatch<ContextActions>;
}

const initialState = {
  dateRange: {
    startDate: moment(Date.now()).subtract(1, 'week').toDate(),
    endDate: moment(Date.now()).toDate(),
  },
  statuses: [],
  search: '',
};

const RunFilterContext = React.createContext<ExtpipeContextType>({
  state: initialState,
  dispatch: () => null,
});

export interface RunFilterProviderProps {
  search?: string;
  dateRange?: Range;
  statuses?: RunStatus[];
}

export const runFilterReducer = (
  state: StateType,
  action: ContextActions
): StateType => {
  switch (action.type) {
    case RUN_ACTION_TYPE.UPDATE_DATE_RANGE: {
      return {
        ...state,
        dateRange: {
          startDate: action.payload.startDate,
          endDate: action.payload.endDate,
        },
      };
    }
    case RUN_ACTION_TYPE.UPDATE_STATUS: {
      return { ...state, statuses: action.payload };
    }
    case RUN_ACTION_TYPE.UPDATE_SEARCH: {
      return { ...state, search: action.payload };
    }
    default:
      return state;
  }
};

export const RunFilterProvider = ({
  children,
  statuses = initialState.statuses,
  search = initialState.search,
  dateRange = initialState.dateRange,
}: PropsWithChildren<RunFilterProviderProps>) => {
  const [state, dispatch] = useReducer(runFilterReducer, {
    statuses,
    search,
    dateRange,
  });

  return (
    <RunFilterContext.Provider value={{ state, dispatch }}>
      {children}
    </RunFilterContext.Provider>
  );
};

export const useRunFilterContext = () => {
  const context = useContext(RunFilterContext);
  if (context === undefined) {
    throw new Error(
      'You can not use run filter context with out RunFilterProvider'
    );
  }
  return context;
};
