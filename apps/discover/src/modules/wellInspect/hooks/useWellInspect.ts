import flatMap from 'lodash/flatMap';
import map from 'lodash/map';
import { sortObjectsAscending } from 'utils/sort';

import { useDeepMemo } from 'hooks/useDeep';
import { useWellsByIds } from 'modules/wellSearch/hooks/useWellsCacheQuerySelectors';
import { Wellbore, WellboreId } from 'modules/wellSearch/types';

import {
  useWellInspectSelection,
  useWellInspectWellboreIds,
  useWellInspectWellIds,
} from '../selectors';

import { useMapToColoredWellbore } from './useMapToColoredWellbore';

export const useWellInspectWells = () => {
  const inspectWellboreIds = useWellInspectWellboreIds();
  const inspectWellIds = useWellInspectWellIds();
  const { wells, error } = useWellsByIds(inspectWellIds);
  const toColoredWellbore = useMapToColoredWellbore();

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
            // @sdk-wells-v3 [String]
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

export const useWellInspectSelectedWells = () => {
  const { wells } = useWellInspectWells();
  const { selectedWellIds, selectedWellboreIds } = useWellInspectSelection();

  return useDeepMemo(
    () =>
      wells
        .filter((well) => selectedWellIds[well.id])
        .map((well) => ({
          ...well,
          wellbores: (well.wellbores || []).filter(
            (wellbore) => selectedWellboreIds[wellbore.id]
          ),
        })),
    [wells, selectedWellIds, selectedWellboreIds]
  );
};

export const useWellInspectSelectedWellbores = (filterByIds?: WellboreId[]) => {
  const wells = useWellInspectSelectedWells();

  return useDeepMemo(() => {
    const wellbores: Wellbore[] = flatMap(wells, 'wellbores');

    if (filterByIds) {
      return wellbores.filter((wellbore) =>
        filterByIds.includes(String(wellbore.id))
      );
    }

    return wellbores;
  }, [wells, filterByIds]);
};

export const useWellInspectSelectedWellboreIds = () => {
  const wellbores = useWellInspectSelectedWellbores();
  return useDeepMemo(() => map(wellbores, 'id'), [wellbores]);
};

export const useWellInspectSelectedWellboreMatchingIds = () => {
  const wellbores = useWellInspectSelectedWellbores();
  return useDeepMemo(
    () => wellbores.map((wellbore) => wellbore.matchingId || ''),
    [wellbores]
  );
};

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
