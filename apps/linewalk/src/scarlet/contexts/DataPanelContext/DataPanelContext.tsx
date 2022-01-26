import React, { useReducer } from 'react';
import { DataElementOrigin } from 'scarlet/types';

import { DataPanelAction, DataPanelActionType, DataPanelState } from './types';

const getAppName = (value: string) => ['scarlet', 'dataPanel', value].join('_');

const getInitialState = (): DataPanelState => ({
  isVisible:
    sessionStorage?.getItem(getAppName('isVisible')) === 'true' || false,
  currentOrigin:
    (sessionStorage?.getItem(
      getAppName('currentOrigin')
    ) as DataElementOrigin) || DataElementOrigin.EQUIPMENT,
});

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
      sessionStorage?.setItem(getAppName('currentOrigin'), action.origin);

      return {
        ...state,
        currentOrigin: action.origin,
      };
    }

    case DataPanelActionType.OPEN_DATA_ELEMENT:
      return {
        ...state,
        visibleDataElement: action.dataElement,
      };

    case DataPanelActionType.CLOSE_DATA_ELEMENT:
      return {
        ...state,
        visibleDataElement: undefined,
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
