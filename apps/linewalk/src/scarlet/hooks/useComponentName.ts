import { useCallback } from 'react';
import { EquipmentComponent } from 'scarlet/types';

import { useAppState } from '.';

export const useComponentName = () => {
  const { equipmentName } = useAppState();

  // -TODO: there should some specific rules of how to name components
  // for example based on component type and a diameter
  const getComponentName = useCallback(
    (component: EquipmentComponent) =>
      `${equipmentName}-${component.id.substring(0, 7)}`,
    [equipmentName]
  );

  return getComponentName;
};
