import React, { useReducer } from 'react';
import { DataElementOrigin } from 'scarlet/types';

import { DataPanelAction, DataPanelActionType, DataPanelState } from './types';

const getStorageName = (value: string) =>
  ['scarlet', 'dataPanel', value].join('_');

const getInitialState = (): DataPanelState => ({
  isVisible:
    sessionStorage?.getItem(getStorageName('isVisible')) === 'true' || false,
  currentOrigin:
    (sessionStorage?.getItem(
      getStorageName('currentOrigin')
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
      sessionStorage?.setItem(getStorageName('currentOrigin'), action.origin);

      return {
        ...state,
        currentOrigin: action.origin,
      };
    }

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
