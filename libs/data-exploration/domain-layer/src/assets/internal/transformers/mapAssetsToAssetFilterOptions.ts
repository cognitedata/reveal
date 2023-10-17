import { Asset } from '@cognite/sdk';

export const mapAssetsToAssetFilterOptions = (
  assets: Asset[]
): { label: string; value: number }[] => {
  return assets.map(({ id, name }) => {
    return {
      label: name,
      value: id,
    };
  });
};
