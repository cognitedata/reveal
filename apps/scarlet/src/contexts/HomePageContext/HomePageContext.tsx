import React, { Reducer, useReducer } from 'react';

import { HomePageAction, HomePageActionType, HomePageState } from './types';

const initialUnitState = {
  unitId: undefined,
  equipmentListQuery: { loading: true },
};

const initialState: HomePageState = {
  facility: undefined,
  unitListQuery: { loading: true },
  ...initialUnitState,
};

export const HomePageDispatchContext = React.createContext<
  React.Dispatch<HomePageAction>
>(() => null);
export const HomePageContext = React.createContext(initialState);

function reducer(state: HomePageState, action: HomePageAction) {
  switch (action.type) {
    case HomePageActionType.SET_FACILITY:
      localStorage?.setItem('scarlet_last_facility_path', action.facility.path);

      if (action.facility.id === state.facility?.id) {
        return state;
      }

      return {
        ...initialState,
        facility: action.facility,
        unitId: action.unitId,
      };
    case HomePageActionType.SET_UNIT_LIST:
      return {
        ...state,
        unitListQuery: action.unitListQuery,
      };
    case HomePageActionType.SET_UNIT:
      if (action.unitId === state.unitId) return state;

      return {
        ...state,
        ...initialUnitState,
        unitId: action.unitId,
      };
    case HomePageActionType.SET_EQUIPMENT_LIST:
      return {
        ...state,
        equipmentListQuery: action.equipmentListQuery,
      };
  }

  return state;
}

export const HomePageProvider: React.FC = (props) => {
  const [state, dispatch] = useReducer<Reducer<HomePageState, HomePageAction>>(
    reducer,
    initialState
  );

  return (
    <HomePageContext.Provider value={state}>
      <HomePageDispatchContext.Provider value={dispatch} {...props} />
    </HomePageContext.Provider>
  );
};
