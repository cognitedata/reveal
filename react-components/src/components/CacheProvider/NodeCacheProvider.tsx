/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, type ReactNode, createContext, useContext, useMemo } from 'react';
import { FdmNodeCache } from './FdmNodeCache';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdmSdk, useSDK } from '../RevealCanvas/SDKProvider';
import { type FdmNodeDataPromises, type ModelRevisionToEdgeMap } from './types';

import assert from 'assert';
import { type DmsUniqueIdentifier } from '../../utilities/FdmSDK';
import { type TypedReveal3DModel } from '../Reveal3DResources/types';
import { type ThreeDModelFdmMappings } from '../../hooks/types';
import { DEFAULT_QUERY_STALE_TIME } from '../../utilities/constants';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { AnyIntersection } from '@cognite/reveal';

export type FdmNodeCacheContent = {
  cache: FdmNodeCache;
};

export const FdmNodeCacheContext = createContext<FdmNodeCacheContent | undefined>(undefined);

export const useFdmNodeCache = (): FdmNodeCacheContent => {
  const content = useContext(FdmNodeCacheContext);

  if (content === undefined) {
    throw Error('Must use useNodeCache inside a NodeCacheContext');
  }

  return content;
};

export const useMappedEdgesForRevisions = (
  modelRevisionIds: Array<{ modelId: number; revisionId: number }>,
  fetchViews = false,
  enabled = true
): UseQueryResult<ModelRevisionToEdgeMap> => {
  const content = useFdmNodeCache();

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      ...modelRevisionIds.map((modelRevisionId) => modelRevisionId.revisionId.toString()).sort(),
      fetchViews
    ],
    queryFn: async () => await content.cache.getAllMappingExternalIds(modelRevisionIds, fetchViews),
    staleTime: Infinity,
    enabled: enabled && modelRevisionIds.length > 0
  });
};

export const useFdm3dNodeDataPromises = (
  intersection: AnyIntersection | undefined
): UseQueryResult<FdmNodeDataPromises> => {
  const content = useFdmNodeCache();

  const isCadModel = intersection?.type === 'cad';

  const [modelId, revisionId, treeIndex] = isCadModel
    ? [intersection.model.modelId, intersection.model.revisionId, intersection.treeIndex]
    : [undefined, undefined, undefined];

  const enableQuery = content !== undefined && isCadModel && treeIndex !== undefined;

  const result = useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'tree-index-to-external-id',
      modelId,
      revisionId,
      treeIndex
    ],
    queryFn: async () => {
      assert(enableQuery);
      return content.cache.getClosestParentDataPromises(modelId, revisionId, treeIndex);
    },

    enabled: enableQuery
  });

  return result;
};

export const useFdmAssetMappings = (
  fdmAssetExternalIds: DmsUniqueIdentifier[],
  models: TypedReveal3DModel[]
): UseQueryResult<ThreeDModelFdmMappings[]> => {
  const nodeCacheContent = useFdmNodeCache();

  return useQuery({
    queryKey: ['reveal', 'react-components', 'fdm-asset-mappings', fdmAssetExternalIds],
    queryFn: async () => {
      return await nodeCacheContent.cache.getMappingsForFdmIds(fdmAssetExternalIds, models);
    },
    enabled: fdmAssetExternalIds.length > 0 && models.length > 0,
    staleTime: DEFAULT_QUERY_STALE_TIME
  });
};

export function NodeCacheProvider({ children }: { children?: ReactNode }): ReactElement {
  const fdmClient = useFdmSdk();
  const cdfClient = useSDK();
  const revealKeepAliveData = useRevealKeepAlive();

  const fdmCache = useMemo(() => {
    const cache =
      revealKeepAliveData?.fdmNodeCache.current ?? new FdmNodeCache(cdfClient, fdmClient);

    const isRevealKeepAliveContextProvided = revealKeepAliveData !== undefined;
    if (isRevealKeepAliveContextProvided) {
      revealKeepAliveData.fdmNodeCache.current = cache;
    }

    return cache;
  }, [cdfClient, fdmClient]);

  return (
    <FdmNodeCacheContext.Provider value={{ cache: fdmCache }}>
      {children}
    </FdmNodeCacheContext.Provider>
  );
}
