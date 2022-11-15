import { InternalAssetTreeData } from '../../internal';

export const concatParents = (
  data: InternalAssetTreeData[]
): InternalAssetTreeData[] => {
  return data.reduce((previousValue, currentValue) => {
    if (previousValue.some(asset => asset.id === currentValue.id)) {
      return previousValue.map(asset => {
        if (asset.id === currentValue.id) {
          return {
            ...asset,
            children: concatParents([
              ...(asset?.children || []),
              ...(currentValue?.children || []),
            ]),
          };
        }

        return asset;
      });
    }

    return [...previousValue, currentValue];
  }, [] as InternalAssetTreeData[]);
};
