import get from 'lodash/get';

import { useDeepMemo } from 'hooks/useDeep';
import { WellboreIdMap } from 'modules/wellSearch/types';

import { WellboreExternalAssetIdMap } from '../../wellSearch/types';

import { useWellInspectSelectedWellbores } from './useWellInspect';

export const useWellInspectWellboreAssetIdMap = () => {
  const wellbores = useWellInspectSelectedWellbores();

  return useDeepMemo(() => {
    return wellbores.reduce<WellboreIdMap>((assetIdMap, wellbore) => {
      const wellboreAssetId = get(
        wellbore,
        'sourceWellbores[0].id',
        wellbore.id
      );
      return {
        ...assetIdMap,
        [wellbore.id]: wellboreAssetId,
      };
    }, {});
  }, [wellbores]);
};

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

// @sdk-wells-v3
export const useWellInspectWellboreIdMap = () => {
  const wellbores = useWellInspectSelectedWellbores();

  return useDeepMemo(
    () =>
      wellbores.reduce<WellboreIdMap>((idMap, wellbore) => {
        if (wellbore.externalId) {
          return { ...idMap, [wellbore.externalId]: wellbore.id };
        }

        const sourceMap = wellbore.sources
          ?.map((source) => source.assetExternalId)
          .reduce((sourceMap, assetExternalId) => {
            return { ...sourceMap, [assetExternalId]: wellbore.matchingId };
          }, {});

        return { ...idMap, ...sourceMap };
      }, {}),
    [wellbores]
  );
};

// @sdk-wells-v3
export const useWellInspectWellboreExternalIdMap = () => {
  const wellbores = useWellInspectSelectedWellbores();

  return useDeepMemo(
    () =>
      wellbores.reduce<WellboreIdMap>((externalIdMap, wellbore) => {
        const sourceExternalIdMap = wellbore.sourceWellbores
          .map((sourceWellbore) => sourceWellbore.externalId)
          .reduce((map, sourceExternalId) => {
            return { ...map, [sourceExternalId]: wellbore.id };
          }, {});

        return { ...externalIdMap, ...sourceExternalIdMap };
      }, {}),
    [wellbores]
  );
};
