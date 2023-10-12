import { useMemo } from 'react';

import { useSearchMappedEquipmentByDataTypeCount } from '../../../providers/Mapped3DEquipmentProvider';
import { sortObjectByNumberValue } from '../../../utils/sort';

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
