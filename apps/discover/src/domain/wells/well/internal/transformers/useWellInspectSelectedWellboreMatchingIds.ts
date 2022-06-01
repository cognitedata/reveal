import { useDeepMemo } from 'hooks/useDeep';

import { useWellInspectSelectedWellbores } from './useWellInspectSelectedWellbores';

export const useWellInspectSelectedWellboreMatchingIds = () => {
  const wellbores = useWellInspectSelectedWellbores();
  return useDeepMemo(
    () => wellbores.map((wellbore) => wellbore.matchingId || ''),
    [wellbores]
  );
};
