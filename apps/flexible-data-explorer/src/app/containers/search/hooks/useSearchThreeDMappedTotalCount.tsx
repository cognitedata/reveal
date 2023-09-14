import { useSearchMappedEquipmentByDataTypeCount } from '../../../providers/Mapped3DEquipmentProvider';

import { SearchTotalCount } from './useSearchTotalCount';

export const useSearchThreeDMappedTotalCount = (enabled = false) => {
  const { data: counts3d, isLoading: isLoading3d } =
    useSearchMappedEquipmentByDataTypeCount(enabled);

  if (enabled && isLoading3d) {
    return {
      totalCount: undefined,
      isLoading: true,
    } satisfies SearchTotalCount;
  }

  const mapped3dCount = Object.values(counts3d ?? {}).reduce(
    (acc, value) => acc + value,
    0
  );

  return {
    totalCount: mapped3dCount,
    isLoading: false,
  } satisfies SearchTotalCount;
};
