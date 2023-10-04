/*!
 * Copyright 2023 Cognite AS
 */

import { ReactElement, ReactNode, createContext, useContext, useMemo } from 'react';
import { CadModelOptions } from '../Reveal3DResources/types';
import { AssetMappingCache } from './AssetMappingCache';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { AssetMapping3D, Node3D } from '@cognite/sdk';
import { useSDK } from '../RevealContainer/SDKProvider';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { ModelId, RevisionId, TreeIndex } from './types';
import { fetchAncestorNodesForTreeIndex } from './requests';


export type AssetMappingCacheContent = {
  cache: AssetMappingCache;
};

export type ModelWithAssetMappings = {
  model: CadModelOptions;
  assetMappings: AssetMapping3D[];
}

const AssetMappingCacheContext = createContext<AssetMappingCacheContent | undefined>(undefined);

const useAssetMappingCache = (): AssetMappingCache => {
  const content = useContext(AssetMappingCacheContext);

  if (content === undefined) {
    throw Error('Must use useAssetMappingCache inside a AssetMappingCacheContext');
  }

  return content.cache;
}

export const useMappeNodesForRevisions = (cadModels: CadModelOptions[]): UseQueryResult<ModelWithAssetMappings[]> => {
  const assetMappingCache = useAssetMappingCache();

  return useQuery(
    ['reveal',
     'react-components',
     'models-asset-mappings',
     ...cadModels.map((model) => `${model.modelId}/${model.revisionId}`).sort()],
    async () => {
      const fetchPromises = cadModels.map(model => assetMappingCache.getAssetMappingsForModel(model.modelId, model.revisionId).then(assetMappings => ({ model, assetMappings})));
      return await Promise.all(fetchPromises);
    },
    { staleTime: Infinity, enabled: cadModels.length > 0 }
  );
}

export const useAssetMappingForTreeIndex = (modelId: ModelId | undefined, revisionId: RevisionId | undefined, treeIndex: TreeIndex | undefined): UseQueryResult<{ node: Node3D, mappings: AssetMapping3D[] } | undefined> => {
  const assetMappingCache = useAssetMappingCache();
  const cdfClient = useSDK();

  const areInputsDefined = modelId !== undefined && revisionId !== undefined && treeIndex !== undefined;

  modelId ??= 0;
  revisionId ??= 0;
  treeIndex ??= 0;

  return useQuery(
    ['reveal',
     'react-components',
     'tree-index-asset-mapping',
     `${modelId}/${revisionId}`,
     treeIndex],
    async () => {
      const ancestors = await fetchAncestorNodesForTreeIndex(modelId!,
                                                             revisionId!,
                                                             treeIndex!,
                                                             cdfClient);

      return assetMappingCache.getAssetMappingForAncestors(modelId!, revisionId!, ancestors);
    },
    { staleTime: Infinity, enabled: areInputsDefined }
  );
}

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
