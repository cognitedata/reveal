import { useMemo } from 'react';
import { DataElement } from 'scarlet/types';
import { getConnectedDataElements } from 'scarlet/utils';

import { useAppState } from './useAppContext';

export const useConnectedDataElements = (dataElement: DataElement) => {
  const appState = useAppState();

  const connectedDataElements = useMemo(
    () => getConnectedDataElements(appState.equipment.data, dataElement),
    [appState.equipment.data, dataElement]
  );

  return connectedDataElements;
};
