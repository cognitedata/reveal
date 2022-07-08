import get from 'lodash/get';

import { useDeepMemo } from 'hooks/useDeep';
import { WellboreExternalAssetIdMap } from 'modules/wellSearch/types';

import { useWellInspectSelectedWellbores } from './useWellInspectSelectedWellbores';

export const useWellInspectWellboreExternalAssetIdMap = () => {
  const wellbores = useWellInspectSelectedWellbores();

  return useDeepMemo(() => {
    return (wellbores || []).reduce<WellboreExternalAssetIdMap>(
      (assetIdMap, wellbore) => {
        const wellboreAssetId = get(
          wellbore,
          'sources[0].assetExternalId',
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
