import React, { useReducer } from 'react';

import {
  Action,
  DataTypesFilters,
  DataTransfersAction,
  DataTransfersError,
  DataTransfersState,
  ProgressState,
  UserAction,
} from '../types';
import { selectColumns } from '../utils';

// State & Reducer
export const initialState: DataTransfersState = {
  status: ProgressState.LOADING,
  data: {
    data: [],
    rawColumns: [],
    allColumnNames: [],
    selectedColumnNames: [],
    columns: [],
  },
  filters: {
    sources: [],
    selectedSource: null,
    selectedTarget: null,
    configurations: [],
    selectedConfiguration: null,
    sourceProjects: [],
    selectedSourceProject: null,
    targetProjects: [],
    selectedTargetProject: null,
    selectedDateRange: {},
    datatypes: [],
    selectedDatatype: null,
  },
  error: undefined,
};

function filterReducer(
  state: DataTransfersState,
  action: DataTransfersAction | UserAction
) {
  switch (action.type) {
    case Action.LOAD: {
      return {
        ...state,
        status: ProgressState.LOADING,
      };
    }
    case Action.SUCCEED: {
      return {
        ...state,
        status: ProgressState.SUCCESS,
        data: { ...state.data, ...action.payload },
      };
    }
    case Action.FAIL: {
      return {
        ...state,
        status: ProgressState.ERROR,
        error: action.error,
      };
    }
    case Action.ADD_COLUMN: {
      const tmp = [action.payload, ...state.data!.selectedColumnNames];
      return {
        ...state,
        data: {
          ...state.data,
          selectedColumnNames: tmp,
          columns: selectColumns(state.data.data, tmp),
        },
      };
    }
    case Action.REMOVE_COLUMN: {
      const tmp = [...state.data.selectedColumnNames];
      tmp.splice(tmp.indexOf(action.payload), 1);
      return {
        ...state,
        data: {
          ...state.data,
          selectedColumnNames: tmp,
          columns: selectColumns(state.data.data, tmp),
        },
      };
    }
    case Action.UPDATE_FILTERS: {
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };
    }
    default: {
      return state;
    }
  }
}

const DataTransfersContext = React.createContext(initialState);
const DataTransfersDispatchContext = React.createContext<any>(false);

// Provider
export const DataTransfersProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  return (
    <DataTransfersContext.Provider value={state}>
      <DataTransfersDispatchContext.Provider value={dispatch}>
        {children}
      </DataTransfersDispatchContext.Provider>
    </DataTransfersContext.Provider>
  );
};

// Hooks
export function useDataTransfersState() {
  const context = React.useContext(DataTransfersContext);
  if (context === undefined) {
    throw new Error('useFilterState must be used within a FilterProvider');
  }
  return context;
}

export function useDataTransfersDispatch() {
  const context = React.useContext(DataTransfersDispatchContext);
  if (context === undefined) {
    throw new Error('useFilterDispatch must be used within a FilterProvider');
  }
  return context;
}

// Interface

export const addColumnName = (payload: string) => ({
  type: Action.ADD_COLUMN,
  payload,
});

export const removeColumnName = (payload: string) => ({
  type: Action.REMOVE_COLUMN,
  payload,
});

export const reportSuccess = (payload?: DataTransfersState['data']) => ({
  type: Action.SUCCEED,
  payload,
});

export const reportLoading = () => ({
  type: Action.LOAD,
});

export const reportError = (error: DataTransfersError) => ({
  type: Action.FAIL,
  error,
});

export const updateFilters = (payload: Partial<DataTypesFilters>) => ({
  type: Action.UPDATE_FILTERS,
  payload,
});
