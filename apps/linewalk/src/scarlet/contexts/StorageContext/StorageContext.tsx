import React, { useReducer } from 'react';

import { StorageAction, StorageActionType, StorageState } from '.';

const equipmentInitialState = {
  pcms: { loading: true },
  documents: { loading: true },
  equipment: { loading: true },
  equipmentConfig: { loading: true },
};

const initialState: StorageState = {
  ...equipmentInitialState,
};

export const StorageDispatchContext = React.createContext<
  React.Dispatch<StorageAction>
>(() => null);
export const StorageContext = React.createContext(initialState);

function reducer(state: StorageState, action: StorageAction) {
  switch (action.type) {
    case StorageActionType.SET_PCMS:
      return {
        ...state,
        pcms: action.pcms,
      };
    case StorageActionType.SET_DOCUMENTS:
      return {
        ...state,
        documents: action.documents,
      };
    case StorageActionType.SET_EQUIPMENT:
      return {
        ...state,
        equipment: action.equipment,
      };
    case StorageActionType.SET_EQUIPMENT_CONFIG:
      return {
        ...state,
        equipmentConfig: action.config,
      };
    case StorageActionType.RESET_EQUIPMENT_DATA:
      return {
        ...state,
        ...equipmentInitialState,
      };
    case StorageActionType.SET_EQUIPMENT_LIST:
      return {
        ...state,
        equipmentList: {
          unitName: action.unitName,
          equipments: action.equipments,
        },
      };
  }

  return state;
}

export const StorageProvider: React.FC = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StorageContext.Provider value={state}>
      <StorageDispatchContext.Provider value={dispatch} {...props} />
    </StorageContext.Provider>
  );
};
