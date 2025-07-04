import { useMemo } from 'react';
import { type CadModelOptions } from '../../components';
import { type ModelWithAssetMappings } from './ModelWithAssetMappings';
import { useClassicCadAssetMappingCache } from '../../components/CacheProvider/CacheProvider';

export const useGenerateAssetMappingCachePerItemFromModelCache = (
  cadModelOptions: CadModelOptions[],
  assetMappings: ModelWithAssetMappings[] | undefined
): void => {
  const assetMappingAndNode3DCache = useClassicCadAssetMappingCache();
  useMemo(() => {
    cadModelOptions.forEach(async ({ modelId, revisionId }) => {
      const assetMapping = assetMappings?.filter(
        (item) => item.model.modelId === modelId && item.model.revisionId === revisionId
      );
      if (assetMapping !== undefined && assetMapping.length > 0) {
        await assetMappingAndNode3DCache.generateAssetMappingsCachePerItemFromModelCache(
          modelId,
          revisionId,
          assetMapping
        );
      }
    });
  }, [cadModelOptions, assetMappings]);
};
