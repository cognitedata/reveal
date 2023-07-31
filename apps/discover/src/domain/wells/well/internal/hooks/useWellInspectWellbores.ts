import { useDeepMemo } from 'hooks/useDeep';

import { useWellInspectWells } from './useWellInspectWells';

export const useWellInspectWellbores = () => {
  const { wells } = useWellInspectWells();

  return useDeepMemo(
    () => wells.flatMap(({ wellbores }) => wellbores),
    [wells]
  );
};
