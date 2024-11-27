/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, type ReactNode, createContext, useContext, useMemo } from 'react';
import { type CadModelOptions } from '../Reveal3DResources/types';
import {
  type AssetMapping,
  AssetMappingAndNode3DCache,
  type NodeAssetMappingResult
} from './AssetMappingAndNode3DCache';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type CogniteInternalId } from '@cognite/sdk';
import { useSDK } from '../RevealCanvas/SDKProvider';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { type ModelRevisionId, type ModelRevisionAssetNodesResult } from './types';
import { fetchAncestorNodesForTreeIndex } from './requests';
import { type AnyIntersection } from '@cognite/reveal';

export type AssetMappingAndNode3DCacheContent = {
  cache: AssetMappingAndNode3DCache;
};

export type ModelWithAssetMappings = {
  model: CadModelOptions;
  assetMappings: AssetMapping[];
};

const AssetMappingAndNode3DCacheContext = createContext<
  AssetMappingAndNode3DCacheContent | undefined
>(undefined);

const useAssetMappingAndNode3DCache = (): AssetMappingAndNode3DCache => {
  const content = useContext(AssetMappingAndNode3DCacheContext);

  if (content === undefined) {
    throw Error('Must use useAssetMappingAndNode3DCache inside a AssetMappingCacheContext');
  }

  return content.cache;
};

export const useGenerateCadAssetMappingsCache = (
  enabled: boolean,
  assetMappings: ModelWithAssetMappings[] | undefined,
  cadModelOptions: CadModelOptions[]
): void => {
  useGenerateNode3DCache(enabled, cadModelOptions, assetMappings);
  useGenerateAssetMappingCachePerItemFromModelCache(enabled, cadModelOptions, assetMappings);
};

export const useGenerateNode3DCache = (
  enabled: boolean,
  cadModelOptions: CadModelOptions[],
  assetMappings: ModelWithAssetMappings[] | undefined
): void => {
  useMemo(() => {
    if (assetMappings === undefined || !enabled) return;
    const assetMappingAndNode3DCache = useAssetMappingAndNode3DCache();
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
  }, [cadModelOptions.length, assetMappings?.length, enabled]);
};

export const useGenerateAssetMappingCachePerItemFromModelCache = (
  enabled: boolean,
  cadModelOptions: CadModelOptions[],
  assetMappings: ModelWithAssetMappings[] | undefined
): void => {
  useMemo(() => {
    if (assetMappings === undefined || !enabled) return;
    const assetMappingAndNode3DCache = useAssetMappingAndNode3DCache();

    cadModelOptions.forEach(async ({ modelId, revisionId }) => {
      const assetMapping = assetMappings?.filter(
        (item) => item.model.modelId === modelId && item.model.revisionId === revisionId
      );
      if (assetMapping !== undefined && assetMapping.length > 0) {
        assetMappingAndNode3DCache.generateAssetMappingsCachePerItemFromModelCache(
          modelId,
          revisionId,
          assetMapping
        );
      }
    });
  }, [cadModelOptions.length, assetMappings?.length, enabled]);
};

export const useAssetMappedNodesForRevisions = (
  cadModels: CadModelOptions[]
): UseQueryResult<ModelWithAssetMappings[]> => {
  const assetMappingAndNode3DCache = useAssetMappingAndNode3DCache();

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'models-asset-mappings',
      ...cadModels.map((model) => `${model.modelId}/${model.revisionId}`).sort()
    ],
    queryFn: async () => {
      const fetchPromises = cadModels.map(
        async (model) =>
          await assetMappingAndNode3DCache
            .getAssetMappingsForModel(model.modelId, model.revisionId, undefined)
            .then((assetMappings) => ({ model, assetMappings }))
      );
      return await Promise.all(fetchPromises);
    },
    staleTime: Infinity,
    enabled: cadModels.length > 0
  });
};

export const useNodesForAssets = (
  models: ModelRevisionId[],
  assetIds: CogniteInternalId[]
): UseQueryResult<ModelRevisionAssetNodesResult[]> => {
  const assetMappingAndNode3DCache = useAssetMappingAndNode3DCache();

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'asset-mapping-nodes',
      ...models.map((model) => `${model.modelId}/${model.revisionId}`),
      ...assetIds.map((id) => `${id}`)
    ],
    queryFn: async () => {
      console.log('TEST RC useNodesForAssets models', models, assetIds.length);
      const modelAndNodeMapPromises = models.map(async (model) => {
        const nodeMap = await assetMappingAndNode3DCache.getNodesForAssetIds(
          model.modelId,
          model.revisionId,
          assetIds
        );
        return { modelId: model.modelId, revisionId: model.revisionId, assetToNodeMap: nodeMap };
      });

      return await Promise.all(modelAndNodeMapPromises);
    },
    staleTime: Infinity,
    enabled: assetIds.length > 0
  });
};

export const useAssetMappingForTreeIndex = (
  intersection: AnyIntersection | undefined
): UseQueryResult<NodeAssetMappingResult> => {
  const assetMappingAndNode3DCache = useAssetMappingAndNode3DCache();
  const cdfClient = useSDK();

  const isCadModel = intersection?.type === 'cad';

  const [modelId, revisionId, treeIndex] = isCadModel
    ? [intersection.model.modelId, intersection.model.revisionId, intersection.treeIndex]
    : [undefined, undefined, undefined];

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'tree-index-asset-mapping',
      `${modelId}/${revisionId}`,
      treeIndex
    ],
    queryFn: async () => {
      const areInputsDefined =
        modelId !== undefined && revisionId !== undefined && treeIndex !== undefined;

      if (!areInputsDefined) {
        return { mappings: [] };
      }

      const ancestors = await fetchAncestorNodesForTreeIndex(
        modelId,
        revisionId,
        treeIndex,
        cdfClient
      );

      return await assetMappingAndNode3DCache.getAssetMappingsForLowestAncestor(
        modelId,
        revisionId,
        ancestors
      );
    },
    staleTime: Infinity
  });
};

export function AssetMappingAndNode3DCacheProvider({
  children
}: {
  children?: ReactNode;
}): ReactElement {
  const cdfClient = useSDK();
  const revealKeepAliveData = useRevealKeepAlive();

  const fdmCache = useMemo(() => {
    const cache =
      revealKeepAliveData?.assetMappingCache.current ?? new AssetMappingAndNode3DCache(cdfClient);

    const isRevealKeepAliveContextProvided = revealKeepAliveData !== undefined;
    if (isRevealKeepAliveContextProvided) {
      revealKeepAliveData.assetMappingCache.current = cache;
    }

    return cache;
  }, [cdfClient]);

  return (
    <AssetMappingAndNode3DCacheContext.Provider value={{ cache: fdmCache }}>
      {children}
    </AssetMappingAndNode3DCacheContext.Provider>
  );
}
