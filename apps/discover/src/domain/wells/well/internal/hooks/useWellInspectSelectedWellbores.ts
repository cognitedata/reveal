import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import flatMap from 'lodash/flatMap';

import { useDeepMemo } from 'hooks/useDeep';
import { WellboreId } from 'modules/wellSearch/types';

import { useWellInspectSelectedWells } from './useWellInspectSelectedWells';

export const useWellInspectSelectedWellbores = (filterByIds?: WellboreId[]) => {
  const wells = useWellInspectSelectedWells();

  return useDeepMemo(() => {
    const wellbores: WellboreInternal[] = flatMap(wells, 'wellbores');

    if (filterByIds) {
      return wellbores.filter((wellbore) =>
        filterByIds.includes(String(wellbore.id))
      );
    }

    return wellbores;
  }, [wells, filterByIds]);
};
