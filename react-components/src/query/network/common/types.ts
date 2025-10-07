import { getAssetsForIds } from './getAssetsForIds';

export type AssetAdvancedFilterAnd = {
  and: AssetAdvancedFilterProps[];
};

export type AssetAdvancedFilterOr = {
  or: AssetAdvancedFilterProps[];
};

export type AssetAdvancedFilterLeaf = Record<string, unknown>;

/**
 * Advanced filters are not directly supported in the SDK, so
 * we need to provide this type ourselves
 */
export type AssetAdvancedFilterProps =
  | AssetAdvancedFilterAnd
  | AssetAdvancedFilterOr
  | AssetAdvancedFilterLeaf;

export type AssetMappedPointCloudAnnotationsDependencies = {
  getAssetsByIds: typeof getAssetsForIds;
};
