/*!
 * Copyright 2024 Cognite AS
 */
import { type CadModelOptions } from '../../components';
import { type ModelWithAssetMappings } from './ModelWithAssetMappings';
import { useAssetMappingAndNode3DCache } from '../../components/CacheProvider/CacheProvider';
import { useMemo } from 'react';

export const useGenerateNode3DCache = (
  cadModelOptions: CadModelOptions[],
  assetMappings: ModelWithAssetMappings[] | undefined
): void => {
  const assetMappingAndNode3DCache = useAssetMappingAndNode3DCache();

  useMemo(() => {
    cadModelOptions.forEach(async ({ modelId, revisionId }) => {
      const assetMapping = assetMappings?.filter(
        (item) => item.model.modelId === modelId && item.model.revisionId === revisionId
      );
      const nodeIdsFromAssetMappings = assetMapping?.flatMap((item) =>
        item.assetMappings.map((mapping) => mapping.nodeId)
      );

      if (nodeIdsFromAssetMappings === undefined || nodeIdsFromAssetMappings.length === 0) return;

      await assetMappingAndNode3DCache.generateNode3DCachePerItem(
        modelId,
        revisionId,
        nodeIdsFromAssetMappings
      );
    });
  }, [cadModelOptions, assetMappings]);
};
