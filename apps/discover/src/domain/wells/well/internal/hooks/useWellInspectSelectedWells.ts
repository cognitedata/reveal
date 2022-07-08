import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectSelection } from 'modules/wellInspect/selectors';

import { useWellInspectWells } from './useWellInspectWells';

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
