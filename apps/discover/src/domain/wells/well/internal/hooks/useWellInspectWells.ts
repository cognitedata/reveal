import { sortWellsByName } from 'domain/wells/well/internal/transformers/sortWellsByName';
import { sortWellboresByName } from 'domain/wells/wellbore/internal/transformers/sortWellboresByName';

import { useDeepMemo } from 'hooks/useDeep';
import {
  useWellInspectWellboreIds,
  useWellInspectWellIds,
} from 'modules/wellInspect/selectors';
import { useWellsByIds } from 'modules/wellSearch/hooks/useWellsCacheQuerySelectors';

export const useWellInspectWells = () => {
  const inspectWellboreIds = useWellInspectWellboreIds();
  const inspectWellIds = useWellInspectWellIds();
  const { wells, error } = useWellsByIds(inspectWellIds);

  return useDeepMemo(() => {
    if (!wells)
      return {
        wells: [],
        error,
      };

    const unsortedWells = wells.map((well) => {
      const unsortedWellbores = well.wellbores?.filter((wellbore) =>
        inspectWellboreIds.includes(String(wellbore.id))
      );

      return {
        ...well,
        wellbores: sortWellboresByName(unsortedWellbores),
      };
    });

    return {
      wells: sortWellsByName(unsortedWells),
      error,
    };
  }, [wells, inspectWellIds, inspectWellboreIds, error]);
};
