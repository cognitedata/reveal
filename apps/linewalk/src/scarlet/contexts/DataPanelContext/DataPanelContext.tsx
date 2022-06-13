import React, { useReducer } from 'react';
import { DataElementOrigin } from 'scarlet/types';

import { DataPanelAction, DataPanelActionType, DataPanelState } from './types';
import { getDetection, toggleDataElement } from './utils';

const getStorageName = (value: string) =>
  ['scarlet', 'dataPanel', value].join('_');

const getInitialState = (): DataPanelState => ({
  isVisible:
    sessionStorage?.getItem(getStorageName('isVisible')) === 'true' || true,
  currentOrigin: DataElementOrigin.EQUIPMENT,
  isActiveNewDataSource: false,
  checkedDataElements: [],
});

export const DataPanelDispatchContext = React.createContext<
  React.Dispatch<DataPanelAction>
>(() => null);

export const DataPanelContext = React.createContext(getInitialState());

function reducer(state: DataPanelState, action: DataPanelAction) {
  switch (action.type) {
    case DataPanelActionType.TOGGLE_PANEL: {
      const isVisible = !state.isVisible;
      sessionStorage?.setItem(
        getStorageName('isVisible'),
        isVisible.toString()
      );

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
      if (state.activeDetection?.id === action.detection.id) return state;
      return {
        ...state,
        activeDetection: action.detection,
      };

    case DataPanelActionType.SET_NEW_MANUAL_DETECTION: {
      if (!state.visibleDataElement) return state;

      const detection = getDetection(action.detectionType, action.annotation);

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

    case DataPanelActionType.OPEN_CONNECTED_ELEMENTS_MODAL:
      return {
        ...state,
        connectedElementsModal: {
          dataElement: action.dataElement,
          detection: action.detection,
        },
      };
    case DataPanelActionType.CLOSE_CONNECTED_ELEMENTS_MODAL:
      return {
        ...state,
        connectedElementsModal: undefined,
      };

    default: {
      return state;
    }
  }
}

export const DataPanelProvider: React.FC = (props) => {
  const [state, dispatch] = useReducer(reducer, getInitialState());

  return (
    <DataPanelContext.Provider value={state}>
      <DataPanelDispatchContext.Provider value={dispatch} {...props} />
    </DataPanelContext.Provider>
  );
};
