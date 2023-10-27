import { useMemo } from 'react';

import { sortObjectByNumberValue } from '@fdx/shared/utils/sort';

import { useSearchMappedEquipmentByDataTypeCount } from '../../ThreeD/providers/Mapped3DEquipmentProvider';

export const useSearchThreeDMappedSortedByKeys = (enabled = true) => {
  const { data: counts3d, ...rest3d } =
    useSearchMappedEquipmentByDataTypeCount(enabled);

  const sortedDataTypesKeys = useMemo(() => {
    if (!counts3d) {
      return [];
    }

    return sortObjectByNumberValue(counts3d);
  }, [counts3d]);

  return { counts: counts3d, keys: sortedDataTypesKeys, ...rest3d };
};
