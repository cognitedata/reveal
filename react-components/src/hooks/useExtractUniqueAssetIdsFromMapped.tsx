/*!
 * Copyright 2024 Cognite AS
 */

import { type InternalId } from '@cognite/sdk';
import { type ModelWithAssetMappings } from '../components/CacheProvider/AssetMappingCacheProvider';
import { useMemo } from 'react';
import { uniqBy } from 'lodash';

export const useExtractUniqueAssetIdsFromMapped = (
  assetMappings: ModelWithAssetMappings[] | undefined
): InternalId[] => {
  return useMemo(() => {
    const mappings = assetMappings?.map((item) => item.assetMappings).flat() ?? [];
    const assetIds: InternalId[] = mappings.flatMap((item) => {
      return {
        id: item.assetId
      };
    });
    const uniqueAssetIds = uniqBy(assetIds, 'id');
    return uniqueAssetIds;
  }, [assetMappings]);
};
