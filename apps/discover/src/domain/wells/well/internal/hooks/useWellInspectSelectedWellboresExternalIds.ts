import { useDeepMemo } from 'hooks/useDeep';

import { useWellInspectSelectedWellbores } from './useWellInspectSelectedWellbores';

export const useWellInspectSelectedWellboresExternalIds = () => {
  const wellbores = useWellInspectSelectedWellbores();

  return useDeepMemo(() => {
    return wellbores.flatMap(({ sources }) =>
      sources.map(({ assetExternalId }) => assetExternalId)
    );
  }, [wellbores]);
};
