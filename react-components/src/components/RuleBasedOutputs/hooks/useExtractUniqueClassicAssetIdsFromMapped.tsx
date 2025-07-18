import { type InternalId } from '@cognite/sdk';
import { type ModelWithAssetMappings } from '../../../hooks/cad/modelWithAssetMappings';
import { useMemo } from 'react';
import { uniqBy } from 'lodash';
import { isDefined } from '../../../utilities/isDefined';
import { isClassicCadAssetMapping } from '../../CacheProvider/cad/assetMappingTypes';

export const useExtractUniqueClassicAssetIdsFromMapped = (
  assetMappings: ModelWithAssetMappings[] | undefined
): InternalId[] => {
  return useMemo(() => {
    const mappings = assetMappings?.map((item) => item.assetMappings).flat() ?? [];
    const assetIds: InternalId[] = mappings
      .filter(isClassicCadAssetMapping)
      .flatMap((item) => {
        return {
          id: item.assetId
        };
      })
      .filter((assetId) => isDefined(assetId.id));
    const uniqueAssetIds = uniqBy(assetIds, (assetId) => assetId.id);
    return uniqueAssetIds;
  }, [assetMappings]);
};
