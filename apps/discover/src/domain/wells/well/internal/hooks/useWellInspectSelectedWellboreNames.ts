import { useDeepMemo } from 'hooks/useDeep';

import { useWellInspectSelectedWellbores } from './useWellInspectSelectedWellbores';

export const useWellInspectSelectedWellboreNames = () => {
  const wellbores = useWellInspectSelectedWellbores();
  return useDeepMemo(
    () =>
      wellbores.map(
        (wellbore) => wellbore?.name || wellbore?.description || ''
      ),
    [wellbores]
  );
};
