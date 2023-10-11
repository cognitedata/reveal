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
import { useSDK } from '../RevealContainer/SDKProvider';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { type ModelId, type RevisionId, type TreeIndex } from './types';
import { fetchAncestorNodesForTreeIndex } from './requests';

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

  return useQuery(
    [
      'reveal',
      'react-components',
      'models-asset-mappings',
      ...cadModels.map((model) => `${model.modelId}/${model.revisionId}`).sort()
    ],
    async () => {
      const fetchPromises = cadModels.map(
        async (model) =>
          await assetMappingCache
            .getAssetMappingsForModel(model.modelId, model.revisionId)
            .then((assetMappings) => ({ model, assetMappings }))
      );
      return await Promise.all(fetchPromises);
    },
    { staleTime: Infinity, enabled: cadModels.length > 0 }
  );
};

export const useAssetMappingForTreeIndex = (
  modelId: ModelId | undefined,
  revisionId: RevisionId | undefined,
  treeIndex: TreeIndex | undefined
): UseQueryResult<NodeAssetMappingResult> => {
  const assetMappingCache = useAssetMappingCache();
  const cdfClient = useSDK();

  return useQuery(
    [
      'reveal',
      'react-components',
      'tree-index-asset-mapping',
      `${modelId}/${revisionId}`,
      treeIndex
    ],
    async () => {
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
    { staleTime: Infinity }
  );
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
