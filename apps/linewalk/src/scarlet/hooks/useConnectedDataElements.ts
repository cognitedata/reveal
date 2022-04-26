import { useMemo } from 'react';
import { getConnectedDataElements } from 'scarlet/utils';

import { useAppState } from './useAppContext';

export const useConnectedDataElements = (dataElementKey: string) => {
  const appState = useAppState();

  const connectedDataElements = useMemo(
    () => getConnectedDataElements(appState.equipment.data, dataElementKey),
    [appState.equipment.data, dataElementKey]
  );

  return connectedDataElements;
};
