import { useContext } from 'react';
import { AppContext, AppDispatchContext } from 'scarlet/contexts';

export const useAppState = () => useContext(AppContext);

export const useAppDispatch = () => useContext(AppDispatchContext);

export const useAppContext = () => {
  const appState = useAppState();
  const appDispatch = useAppDispatch();

  return {
    appState,
    appDispatch,
  };
};
