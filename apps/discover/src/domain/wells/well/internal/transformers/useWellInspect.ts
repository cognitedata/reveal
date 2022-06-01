import { addColorToWellbore } from 'domain/wells/wellbore/internal/transformers/addColorToWellbore';

import { sortObjectsAscending } from 'utils/sort';

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
  const toColoredWellbore = addColorToWellbore();

  return useDeepMemo(() => {
    if (!wells)
      return {
        wells: [],
        error,
      };

    const unsortedWells = wells.map((well) => {
      const unsortedWellbores =
        well.wellbores
          ?.filter((wellbore) =>
            inspectWellboreIds.includes(String(wellbore.id))
          )
          .map(toColoredWellbore) || [];

      return {
        ...well,
        wellbores: sortObjectsAscending(unsortedWellbores, 'name'), // Move to data layer when refactoring.
      };
    });

    return {
      wells: sortObjectsAscending(unsortedWells, 'name'),
      error,
    }; // Move to data layer when refactoring.
  }, [wells, inspectWellIds, inspectWellboreIds, error]);
};
