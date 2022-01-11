import React, { useReducer } from 'react';

import { StorageAction, StorageActionType, StorageState } from '.';

const initialState: StorageState = {
  pcms: { loading: true },
  documents: { loading: true },
  scanner: { loading: true },
};

export const StorageDispatchContext = React.createContext<
  React.Dispatch<StorageAction>
>(() => null);
export const StorageContext = React.createContext(initialState);
export const StorageDocumentsContext = React.createContext(
  initialState.documents
);

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
    case StorageActionType.SET_SCANNER:
      return {
        ...state,
        scanner: action.scanner,
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
