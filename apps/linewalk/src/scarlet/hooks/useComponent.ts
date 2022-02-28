import { useMemo } from 'react';

import { useAppState } from '.';

export const useComponent = (componentId?: string) => {
  const { equipment, equipmentConfig } = useAppState();
  const result = useMemo(() => {
    const component = componentId
      ? equipment.data?.components.find(
          (component) => component.id === componentId
        )
      : undefined;

    const componentGroup = component
      ? equipmentConfig.data?.equipmentTypes[equipment.data!.type]
          .componentTypes[component.type]
      : undefined;

    return { component, componentGroup };
  }, [componentId, equipment.data]);

  return result;
};
