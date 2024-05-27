/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, type ReactNode, createContext, useContext, useMemo } from 'react';
import { type CadModelOptions } from '../Reveal3DResources/types';
import {
  type AssetMapping,
  AssetMappingCache,
  type NodeAssetMappingResult
} from './AssetMappingCache';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type CogniteInternalId } from '@cognite/sdk';
import { useSDK } from '../RevealCanvas/SDKProvider';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import {
  type ModelRevisionId,
  type ModelId,
  type RevisionId,
  type TreeIndex,
  type ModelRevisionAssetNodesResult
} from './types';
import { fetchAncestorNodesForTreeIndex } from './requests';
import { AnyIntersection } from '@cognite/reveal';

export type AssetMappingCacheContent = {
  cache: AssetMappingCache;
};

export type ModelWithAssetMappings = {
  model: CadModelOptions;
  assetMappings: AssetMapping[];
};

const AssetMappingCacheContext = createContext<AssetMappingCacheContent | undefined>(undefined);

const useAssetMappingCache = (): AssetMappingCache => {
  const content = useContext(AssetMappingCacheContext);

  if (content === undefined) {
    throw Error('Must use useAssetMappingCache inside a AssetMappingCacheContext');
  }

  return content.cache;
};

export const useAssetMappedNodesForRevisions = (
  cadModels: CadModelOptions[]
): UseQueryResult<ModelWithAssetMappings[]> => {
  const assetMappingCache = useAssetMappingCache();

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
          await assetMappingCache
            .getAssetMappingsForModel(model.modelId, model.revisionId)
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
  const assetMappingCache = useAssetMappingCache();

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'asset-mapping-nodes',
      ...models.map((model) => `${model.modelId}/${model.revisionId}`),
      ...assetIds.map((id) => `${id}`)
    ],
    queryFn: async () => {
      const modelAndNodeMapPromises = models.map(async (model) => {
        const nodeMap = await assetMappingCache.getNodesForAssetIds(
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
  const assetMappingCache = useAssetMappingCache();
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

      return await assetMappingCache.getAssetMappingsForLowestAncestor(
        modelId,
        revisionId,
        ancestors
      );
    },
    staleTime: Infinity
  });
};

export function AssetMappingCacheProvider({ children }: { children?: ReactNode }): ReactElement {
  const cdfClient = useSDK();
  const revealKeepAliveData = useRevealKeepAlive();

  const fdmCache = useMemo(() => {
    const cache =
      revealKeepAliveData?.assetMappingCache.current ?? new AssetMappingCache(cdfClient);

    const isRevealKeepAliveContextProvided = revealKeepAliveData !== undefined;
    if (isRevealKeepAliveContextProvided) {
      revealKeepAliveData.assetMappingCache.current = cache;
    }

    return cache;
  }, [cdfClient]);

  return (
    <AssetMappingCacheContext.Provider value={{ cache: fdmCache }}>
      {children}
    </AssetMappingCacheContext.Provider>
  );
}
