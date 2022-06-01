import { useWellInspectWells } from 'domain/wells/well/internal/transformers/useWellInspect';

import { useMemo } from 'react';

import pickBy from 'lodash/pickBy';

import { useDeepMemo } from 'hooks/useDeep';
import useSelector from 'hooks/useSelector';
import { getIndeterminateWells } from 'modules/wellSearch/utils/wells';

export const useWellInspect = () => {
  return useSelector((state) => {
    return state.wellInspect;
  });
};

export const useWellInspectWellIds = () => {
  const state = useWellInspect();
  return useMemo(
    () => Object.keys(state.selectedWellIds),
    [state.selectedWellIds]
  );
};

export const useWellInspectWellboreIds = () => {
  const state = useWellInspect();
  return useMemo(
    () => Object.keys(state.selectedWellboreIds),
    [state.selectedWellboreIds]
  );
};

export const useWellInspectSelection = () => {
  const { selectedWellIds, selectedWellboreIds } = useWellInspect();
  return { selectedWellIds, selectedWellboreIds };
};

export const useWellInspectSelectionStats = () => {
  const { selectedWellIds, selectedWellboreIds } = useWellInspect();
  return useDeepMemo(
    () => ({
      wellsCount: Object.keys(selectedWellIds).length,
      wellboresCount: Object.keys(selectedWellboreIds).length,
      selectedWellsCount: Object.keys(pickBy(selectedWellIds)).length,
      selectedWellboresCount: Object.keys(pickBy(selectedWellboreIds)).length,
    }),
    [selectedWellIds, selectedWellboreIds]
  );
};

export const useWellInspectIndeterminateWells = () => {
  const { wells } = useWellInspectWells();
  return useSelector((state) =>
    getIndeterminateWells(wells, state.wellInspect.selectedWellboreIds)
  );
};

export const useWellInspectGoBackNavigationPath = () => {
  const state = useWellInspect();
  return state.goBackNavigationPath;
};

export const useColoredWellbores = () => {
  return useSelector((state) => state.wellInspect.coloredWellbores);
};
