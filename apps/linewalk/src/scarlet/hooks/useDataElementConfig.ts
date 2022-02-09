import { useMemo } from 'react';
import { DataElement, DataElementOrigin } from 'scarlet/types';

import { useAppState } from '.';

export const useDataElementConfig = (dataElement?: DataElement) => {
  const { equipmentConfig } = useAppState();
  const config = useMemo(() => {
    if (!dataElement)
      return { label: undefined, unit: undefined, type: undefined };

    const configElements =
      dataElement.origin === DataElementOrigin.COMPONENT
        ? equipmentConfig.data?.equipmentElements
        : equipmentConfig.data?.componentElements;

    return (
      (configElements && configElements[dataElement.key]) || {
        label: dataElement.key,
        type: undefined,
        unit: undefined,
      }
    );
  }, [dataElement, equipmentConfig.data]);

  return config;
};
