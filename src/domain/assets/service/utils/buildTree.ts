import { InternalAssetTreeData } from '../../internal';

export const buildTree = (
  asset: InternalAssetTreeData,
  assetMap: Record<string, InternalAssetTreeData>
): InternalAssetTreeData => {
  const parentAsset = asset.parentId ? assetMap[asset?.parentId] : undefined;

  const mappedAsset = parentAsset
    ? { ...parentAsset, children: [asset] }
    : undefined;

  return mappedAsset ? buildTree(mappedAsset, assetMap) : asset;
};
