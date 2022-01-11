import { useContext } from 'react';

import { DataPanelContext, DataPanelDispatchContext } from '../contexts';

export const useDataPanelState = () => useContext(DataPanelContext);
export const useDataPanelDispatch = () => useContext(DataPanelDispatchContext);

export const useDataPanel = () => {
  const dataPanelState = useDataPanelState();
  const dataPanelDispatch = useDataPanelDispatch();

  return {
    dataPanelState,
    dataPanelDispatch,
  };
};
