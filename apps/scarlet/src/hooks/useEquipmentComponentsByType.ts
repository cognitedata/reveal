import { useMemo } from 'react';
import { EquipmentComponentType, EquipmentComponent } from 'types';

import { useAppState } from '.';

export const useEquipmentComponentsByType = (type?: EquipmentComponentType) => {
  const { equipment } = useAppState();
  const allComponents = equipment.data?.components;
  const {
    components,
    subComponents,
  }: { components: EquipmentComponent[]; subComponents: EquipmentComponent[] } =
    useMemo(() => {
      if (!type) return { components: [], subComponents: [] };
      const components =
        allComponents?.filter((component) => component.type === type) || [];

      let subComponents: EquipmentComponent[] = [];
      if (type === EquipmentComponentType.SHELL) {
        subComponents =
          allComponents?.filter(
            (component) => component.type === EquipmentComponentType.COURSE
          ) || [];
      }

      return { components, subComponents };
    }, [allComponents, type]);

  return { components, subComponents, loading: equipment.loading };
};
