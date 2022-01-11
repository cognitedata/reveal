import { useMemo } from 'react';

import { DataElementProps, EquipmentElement, ScannerData } from '../types';
import {
  equipmentElementsConfig,
  equipmentElementsPriorityConfig,
} from '../config';

export const useEquipmentElements = (data: ScannerData) => {
  const equipmentElements = useMemo((): DataElementProps[] | undefined => {
    if (!data) return undefined;

    const { equipment } = data;
    const keysWithoutPriority = Object.keys(equipment).filter(
      (key) =>
        !equipmentElementsPriorityConfig.includes(key as EquipmentElement) &&
        key !== 'components'
    );

    return [
      ...equipmentElementsPriorityConfig.filter((key) => key in equipment),
      ...keysWithoutPriority,
    ]
      .map((key) => {
        const element = equipment[key];
        let elementConfig = equipmentElementsConfig[key as EquipmentElement];

        if (!elementConfig) {
          console.error('Missing configuration for equipment key:', key);
          elementConfig = { label: key };
        }

        return {
          scannerKey: key,
          ...element,
          ...elementConfig,
        } as DataElementProps;
      })
      .filter((item) => item) as DataElementProps[];
  }, [data]);

  return equipmentElements;
};
