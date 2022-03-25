import React, { useEffect, useReducer } from 'react';
import { DataElementOrigin } from 'scarlet/types';

import { DataPanelAction, DataPanelActionType, DataPanelState } from './types';
import { getDetection, toggleDataElement } from './utils';

const getAppName = (value: string) => ['scarlet', 'dataPanel', value].join('_');

const getInitialState = (): DataPanelState => ({
  isVisible:
    sessionStorage?.getItem(getAppName('isVisible')) === 'true' || true,
  currentOrigin:
    (sessionStorage?.getItem(
      getAppName('currentOrigin')
    ) as DataElementOrigin) || DataElementOrigin.EQUIPMENT,
  isActiveNewDataSource: false,
  checkedDataElements: [],
});

const saveCurrentOrigin = (origin: DataElementOrigin) => {
  sessionStorage?.setItem(getAppName('currentOrigin'), origin);
};

export const DataPanelDispatchContext = React.createContext<
  React.Dispatch<DataPanelAction>
>(() => null);

export const DataPanelContext = React.createContext(getInitialState());

function reducer(state: DataPanelState, action: DataPanelAction) {
  switch (action.type) {
    case DataPanelActionType.TOGGLE_PANEL: {
      const isVisible = !state.isVisible;
      sessionStorage?.setItem(getAppName('isVisible'), isVisible.toString());

      return {
        ...state,
        isVisible,
      };
    }

    case DataPanelActionType.SET_CURRENT_ORIGIN: {
      if (action.origin === state.currentOrigin) return state;

      return {
        ...state,
        currentOrigin: action.origin,
        visibleDataElement: undefined,
        activeDetection: undefined,
        newDetection: undefined,
        activeNewDataSource: false,
        checkedDataElements: [],
      };
    }

    case DataPanelActionType.OPEN_DATA_ELEMENT:
      return {
        ...state,
        isVisible: true,
        visibleDataElement: action.dataElement,
        activeDetection: action.detection,
        currentOrigin: action.dataElement.origin,
        checkedDataElements: [],
      };

    case DataPanelActionType.CLOSE_DATA_ELEMENT:
      return {
        ...state,
        visibleDataElement: undefined,
        activeDetection: undefined,
        newDetection: undefined,
        activeNewDataSource: false,
      };

    case DataPanelActionType.SET_ACTIVE_DETECTION:
      return {
        ...state,
        activeDetection: action.detection,
      };

    case DataPanelActionType.SET_NEW_MANUAL_DETECTION: {
      if (!state.visibleDataElement) return state;

      const detection = getDetection(
        state.visibleDataElement,
        action.detectionType,
        action.annotation
      );

      return {
        ...state,
        newDetection: detection,
        activeDetection: detection,
        activeNewDataSource: false,
      };
    }

    case DataPanelActionType.REMOVE_NEW_DETECTION:
      return {
        ...state,
        newDetection: undefined,
      };

    case DataPanelActionType.TOGGLE_NEW_DATA_SOURCE:
      if (state.isActiveNewDataSource === action.isActive) return state;

      return {
        ...state,
        isActiveNewDataSource: action.isActive,
        activeDetection: action.isActive ? undefined : state.activeDetection,
      };

    case DataPanelActionType.TOGGLE_DATA_ELEMENT: {
      const checkedDataElements = toggleDataElement(
        state.checkedDataElements,
        action.dataElement,
        action.checked
      );

      return {
        ...state,
        checkedDataElements,
      };
    }

    case DataPanelActionType.UNCHECK_ALL_DATA_ELEMENTS:
      return {
        ...state,
        checkedDataElements: [],
      };

    default: {
      return state;
    }
  }
}

export const DataPanelProvider: React.FC = (props) => {
  const [state, dispatch] = useReducer(reducer, getInitialState());

  useEffect(() => {
    saveCurrentOrigin(state.currentOrigin);
  }, [state.currentOrigin]);

  return (
    <DataPanelContext.Provider value={state}>
      <DataPanelDispatchContext.Provider value={dispatch} {...props} />
    </DataPanelContext.Provider>
  );
};
