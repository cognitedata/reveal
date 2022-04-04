import { useMemo } from 'react';
import { DataElement } from 'scarlet/types';
import { getDataElementConfig } from 'scarlet/utils';

import { useAppState } from '.';

export const useDataElementConfig = (dataElement?: DataElement) => {
  const { equipmentConfig } = useAppState();

  const config = useMemo(
    () => getDataElementConfig(equipmentConfig.data, dataElement),
    [dataElement, equipmentConfig.data]
  );

  return config;
};
