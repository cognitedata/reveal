import compact from 'lodash/compact';
import keyBy from 'lodash/keyBy';

import { useDeepMemo } from 'hooks/useDeep';

import { useWells } from '../selectors';
import { WellId, WellMap } from '../types';

import { useWellSearchResultQuery } from './useWellSearchResultQuery';

// can we deprecate this?
export const useWellQueryResultWells = () => {
  const { data } = useWellSearchResultQuery();
  return data ? data.wells : [];
};

export const useWellQueryResultWellbores = (wellIds: WellId[]) => {
  const wells = useWellQueryResultWells();

  return useDeepMemo(
    () =>
      compact(
        wells
          .filter((well) => wellIds.includes(well.id))
          .flatMap((well) => well.wellbores)
      ),
    [wells]
  );
};

export const useWellQueryResultWellIds = () => {
  const wells = useWellQueryResultWells();
  return useDeepMemo(() => wells.map((well) => String(well.id)), [wells]);
};

export const useWellQueryResultSelectedWells = () => {
  const wells = useWellQueryResultWells();
  const { selectedWellIds, selectedWellboreIds } = useWells();

  return useDeepMemo(
    () =>
      wells
        .filter((well) => selectedWellIds[well.id])
        .map((well) => ({
          ...well,
          wellbores: well.wellbores?.filter(
            (wellbore) => selectedWellboreIds[wellbore.id]
          ),
        })),
    [wells]
  );
};

export const useWellQueryResultWellsById = () => {
  const wells = useWellQueryResultWells();
  return useDeepMemo(() => keyBy<WellMap>(wells, 'id'), [wells]);
};
