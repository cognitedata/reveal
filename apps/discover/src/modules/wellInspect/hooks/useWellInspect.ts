import flatMap from 'lodash/flatMap';
import map from 'lodash/map';

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
  const wells = useWellsByIds(inspectWellIds);
  const toColoredWellbore = useMapToColoredWellbore();

  return useDeepMemo(() => {
    if (!wells) return [];

    return wells.map((well) => ({
      ...well,
      wellbores:
        well.wellbores
          ?.filter((wellbore) =>
            // @sdk-wells-v3 [String]
            inspectWellboreIds.includes(String(wellbore.id))
          )
          .map(toColoredWellbore) || [],
    }));
  }, [wells, inspectWellIds, inspectWellboreIds]);
};

export const useWellInspectSelectedWells = () => {
  const wells = useWellInspectWells();
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
  const wells = useWellInspectWells();
  const { selectedWellboreIds } = useWellInspectSelection();

  return useDeepMemo(() => {
    const wellbores: Wellbore[] = flatMap(wells, 'wellbores');

    if (filterByIds) {
      return wellbores.filter(
        (wellbore) =>
          selectedWellboreIds[wellbore.id] &&
          filterByIds.includes(String(wellbore.id))
      );
    }

    return wellbores.filter((wellbore) => selectedWellboreIds[wellbore.id]);
  }, [wells, selectedWellboreIds, filterByIds]);
};

export const useWellInspectSelectedWellboreIds = () => {
  const wellbores = useWellInspectSelectedWellbores();
  return useDeepMemo(() => map(wellbores, 'id'), [wellbores]);
};

export const useWellInspectSelectedWellboreNames = () => {
  const wellbores = useWellInspectSelectedWellbores();
  return useDeepMemo(
    () => wellbores.map((wellbore) => wellbore.description || ''),
    [wellbores]
  );
};
