import { WellboreExternalAssetIdMap } from '../types';

export const getWellboreExternalAssetIdReverseMap = (
  wellboreAssetIdMap: WellboreExternalAssetIdMap
) => {
  return Object.keys(wellboreAssetIdMap).reduce(
    (idMap, wellboreId: string) => ({
      ...idMap,
      [wellboreAssetIdMap[String(wellboreId)]]: wellboreId,
    }),
    {} as { [key: string]: string }
  );
};
