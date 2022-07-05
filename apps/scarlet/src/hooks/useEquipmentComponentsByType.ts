import { useMemo } from 'react';
import { EquipmentComponentType, EquipmentComponent } from 'types';

import { useAppState } from '.';

export const useEquipmentComponentsByType = (type?: EquipmentComponentType) => {
  const { equipment } = useAppState();
  const allComponents = equipment.data?.components;
  const components: EquipmentComponent[] = useMemo(() => {
    if (!type) return [];
    const result =
      allComponents?.filter((component) => component.type === type) || [];

    return result;
  }, [allComponents, type]);

  return { components, loading: equipment.loading };
};
