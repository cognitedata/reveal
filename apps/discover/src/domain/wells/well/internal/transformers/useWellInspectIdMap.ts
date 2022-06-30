import get from 'lodash/get';

import { useDeepMemo } from 'hooks/useDeep';
import {
  WellboreId,
  WellId,
  WellboreExternalAssetIdMap,
} from 'modules/wellSearch/types';

import { useWellInspectSelectedWellbores } from './useWellInspectSelectedWellbores';
import { useWellInspectSelectedWells } from './useWellInspectSelectedWells';

export const useWellInspectWellboreExternalAssetIdMap = () => {
  const wellbores = useWellInspectSelectedWellbores();

  return useDeepMemo(() => {
    return (wellbores || []).reduce<WellboreExternalAssetIdMap>(
      (assetIdMap, wellbore) => {
        const wellboreAssetId = get(
          wellbore,
          'sourceWellbores[0].externalId',
          wellbore?.externalId
        );
        return {
          ...assetIdMap,
          [wellbore.id]: wellboreAssetId,
        };
      },
      {}
    );
  }, [wellbores]);
};

export const useWellInspectWellboreWellIdMap = () => {
  const wells = useWellInspectSelectedWells();

  return useDeepMemo(() => {
    return wells.reduce<Record<WellboreId, WellId>>(
      (wellboreWellIdMap, well) => {
        const wellboreWellIdMapOfWell = well.wellbores.reduce<
          Record<WellboreId, WellId>
        >(
          (idMap, wellbore) => ({
            ...idMap,
            [wellbore.id]: well.id,
          }),
          {}
        );

        return {
          ...wellboreWellIdMap,
          ...wellboreWellIdMapOfWell,
        };
      },
      {}
    );
  }, [wells]);
};

export const useWellInspectWellIdNameMap = () => {
  const wells = useWellInspectSelectedWells();

  return useDeepMemo(
    () =>
      wells.reduce<Record<WellboreId, string>>(
        (idNameMap, well) => ({
          ...idNameMap,
          [well.id]: well.name,
        }),
        {}
      ),
    [wells]
  );
};

export const useWellInspectWellboreIdNameMap = () => {
  const wellbores = useWellInspectSelectedWellbores();

  return useDeepMemo(
    () =>
      wellbores.reduce<Record<WellboreId, string>>(
        (idNameMap, wellbore) => ({
          ...idNameMap,
          [wellbore.id]: wellbore.name,
        }),
        {}
      ),
    [wellbores]
  );
};
