import { partition } from 'lodash';
import { isInternalId } from '../../utilities/instanceIds';
import { type IdEither } from '@cognite/sdk';
import { type AssetAdvancedFilterProps } from './types';
import { isDefined } from '../../utilities/isDefined';

export function buildClassicAssetQueryFilter(query: string): AssetAdvancedFilterProps | undefined {
  if (query === '') {
    return undefined;
  }

  const searchConditions = [
    { search: { property: ['name'], value: query } },
    { search: { property: ['description'], value: query } }
  ];

  return {
    or: searchConditions
  };
}

export function buildClassicAssetIdFilter(
  assetRefs: IdEither[]
): AssetAdvancedFilterProps | undefined {
  if (assetRefs.length === 0) {
    return undefined;
  }

  const [internalIdEithers, externalIdEithers] = partition(assetRefs, isInternalId);
  const internalIds = internalIdEithers.map((internalIdEither) => internalIdEither.id);
  const externalIds = externalIdEithers.map((externalIdEither) => externalIdEither.externalId);

  const externalIdsFilter =
    externalIds.length > 0 ? buildAssetExternalIdFilter(externalIds) : undefined;
  const internalIdsFilter =
    internalIds.length > 0 ? buildAssetInternalIdFilter(internalIds) : undefined;

  if (externalIdsFilter !== undefined && internalIdsFilter !== undefined) {
    return { and: [externalIdsFilter, internalIdsFilter] };
  }
  return externalIdsFilter ?? internalIdsFilter;
}

function buildAssetInternalIdFilter(assetIds: number[]): AssetAdvancedFilterProps {
  return {
    in: {
      property: ['id'],
      values: assetIds
    }
  };
}

function buildAssetExternalIdFilter(externalIds: string[]): AssetAdvancedFilterProps {
  return {
    in: {
      property: ['externalId'],
      values: externalIds
    }
  };
}

export function combineClassicAssetFilters(
  filters: Array<AssetAdvancedFilterProps | undefined>
): AssetAdvancedFilterProps | undefined {
  const definedFilters = filters.filter(isDefined);

  if (definedFilters.length === 0) {
    return undefined;
  }

  if (definedFilters.length === 1) {
    return definedFilters[0];
  }

  return { and: definedFilters };
}
