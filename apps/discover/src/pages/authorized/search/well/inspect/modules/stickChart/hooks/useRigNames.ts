import { useWellboreRigNamesMap } from 'domain/wells/rigOperations/internal/hooks/useWellboreRigNamesMap';

import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

export const useRigNames = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data } = useWellboreRigNamesMap({
    wellboreIds,
  });

  return data;
};
