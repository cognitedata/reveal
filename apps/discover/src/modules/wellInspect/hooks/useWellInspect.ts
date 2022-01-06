import flatMap from 'lodash/flatMap';
import map from 'lodash/map';

import { useDeepMemo } from 'hooks/useDeep';
import { useWellsByIds } from 'modules/wellSearch/hooks/useWellsQuerySelectors';
import { Wellbore, WellboreId } from 'modules/wellSearch/types';

import { WELLBORE_COLORS } from '../constants';
import {
  useWellInspectSelection,
  useWellInspectWellboreIds,
  useWellInspectWellIds,
} from '../selectors';

export const useWellInspectWells = () => {
  const inspectWellIds = useWellInspectWellIds();
  const inspectWellboreIds = useWellInspectWellboreIds();
  const wells = useWellsByIds(inspectWellIds);

  let wellboreIndex = -1;
  const colors = [
    ...WELLBORE_COLORS,
    ...WELLBORE_COLORS.map((color) => `${color}_`),
  ];

  return useDeepMemo(() => {
    if (!wells) return [];

    return wells.map((well) => ({
      ...well,
      wellbores:
        well.wellbores
          ?.filter((wellbore) => inspectWellboreIds.includes(wellbore.id))
          .map((wellbore) => {
            wellboreIndex += 1;
            const colorIndex = wellboreIndex % colors.length;
            return {
              ...wellbore,
              metadata: {
                ...wellbore.metadata,
                color: colors[colorIndex],
              },
            } as Wellbore;
          }) || [],
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
          selectedWellboreIds[wellbore.id] && filterByIds.includes(wellbore.id)
      );
    }

    return wellbores.filter((wellbore) => selectedWellboreIds[wellbore.id]);
  }, [wells, selectedWellboreIds]);
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
