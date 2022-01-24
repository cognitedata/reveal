import { useContext } from 'react';
import { DataPanelContext, DataPanelDispatchContext } from 'scarlet/contexts';

export const useDataPanelState = () => useContext(DataPanelContext);
export const useDataPanelDispatch = () => useContext(DataPanelDispatchContext);

export const useDataPanelContext = () => {
  const dataPanelState = useDataPanelState();
  const dataPanelDispatch = useDataPanelDispatch();

  return {
    dataPanelState,
    dataPanelDispatch,
  };
};
