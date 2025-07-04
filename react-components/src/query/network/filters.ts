import { type AssetFilterProps } from '@cognite/sdk';

/*
 * AssetAdvancedFilterProps
 */

export type AssetAdvancedFilterAnd = {
  and: AssetAdvancedFilterProps[];
};

export type AssetAdvancedFilterOr = {
  or: AssetAdvancedFilterProps[];
};

export type AssetAdvancedFilterLeaf = Record<string, unknown>;

// Advanced filters are not directly supported in the SDK, so
// we need to provide this type ourselves
export type AssetAdvancedFilterProps =
  | AssetAdvancedFilterAnd
  | AssetAdvancedFilterOr
  | AssetAdvancedFilterLeaf;

export function isLeafFilter(filter: AssetAdvancedFilterProps): filter is AssetAdvancedFilterLeaf {
  return !isBooleanFilter(filter);
}

function isBooleanFilter(
  filter: AssetAdvancedFilterProps
): filter is AssetAdvancedFilterAnd | AssetAdvancedFilterOr {
  return isAndFilter(filter) || isOrFilter(filter);
}

export function isAndFilter(filter: AssetAdvancedFilterProps): filter is AssetAdvancedFilterAnd {
  return 'and' in filter;
}
export function isOrFilter(filter: AssetAdvancedFilterProps): filter is AssetAdvancedFilterOr {
  return 'or' in filter;
}

/*
 * AllAssetFilterProps
 */

export type AllAssetFilterProps = {
  filter?: AssetFilterProps;
  advancedFilter?: AssetAdvancedFilterProps;
};

export function hasFilters(
  allAssetFilters: AllAssetFilterProps | undefined
): allAssetFilters is AllAssetFilterProps {
  return allAssetFilters?.filter !== undefined || allAssetFilters?.advancedFilter !== undefined;
}
