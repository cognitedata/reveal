import { useMemo } from 'react';
import { DataElementState } from 'scarlet/types';

import { useAppState } from './useAppContext';

export const useConnectedDataElements = (dataElementKey: string) => {
  const appState = useAppState();
  const equipmentData = appState.equipment.data;
  const connectedDataElements = useMemo(() => {
    const list = [];
    const equipmentElement = equipmentData?.equipmentElements
      .filter((dataElement) => dataElement.state !== DataElementState.OMITTED)
      .find((item) => item.key === dataElementKey);
    if (equipmentElement) list.push(equipmentElement);

    equipmentData?.components.forEach((component) => {
      const componentElement = component.componentElements
        .filter((dataElement) => dataElement.state !== DataElementState.OMITTED)
        .find((item) => item.key === dataElementKey);
      if (componentElement) list.push(componentElement);
    });
    return list;
  }, [dataElementKey, equipmentData]);

  return connectedDataElements;
};
