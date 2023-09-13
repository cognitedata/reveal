/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, type ReactNode, createContext, useContext, useMemo } from 'react';
import { FdmNodeCache } from './FdmNodeCache';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdmSdk, useSDK } from '../RevealContainer/SDKProvider';
import { type FdmEdgeWithNode, type ModelRevisionToEdgeMap } from './types';

import assert from 'assert';
import { type DmsUniqueIdentifier } from '../../utilities/FdmSDK';
import { type TypedReveal3DModel } from '../Reveal3DResources/types';
import { type ThreeDModelMappings } from '../../hooks/types';
import { DEFAULT_QUERY_STALE_TIME } from '../../utilities/constants';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';

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

  return useQuery(
    [
      'reveal',
      'react-components',
      ...modelRevisionIds.map((modelRevisionId) => modelRevisionId.revisionId.toString()).sort(),
      fetchViews
    ],
    async () => await content.cache.getAllMappingExternalIds(modelRevisionIds, fetchViews),
    { staleTime: Infinity, enabled: enabled && modelRevisionIds.length > 0 }
  );
};

export const useFdm3dNodeData = (
  modelId: number | undefined,
  revisionId: number | undefined,
  treeIndex: number | undefined
): UseQueryResult<Array<Required<FdmEdgeWithNode>>> => {
  const content = useFdmNodeCache();

  const enableQuery =
    content !== undefined &&
    modelId !== undefined &&
    revisionId !== undefined &&
    treeIndex !== undefined;

  const result = useQuery(
    ['reveal', 'react-components', 'tree-index-to-external-id', modelId, revisionId, treeIndex],
    async () => {
      assert(enableQuery);
      return await content.cache.getClosestParentExternalId(modelId, revisionId, treeIndex);
    },
    {
      enabled: enableQuery
    }
  );

  return result;
};

export const useFdmAssetMappings = (
  fdmAssetExternalIds: DmsUniqueIdentifier[],
  models: TypedReveal3DModel[]
): UseQueryResult<ThreeDModelMappings[]> => {
  const nodeCacheContent = useFdmNodeCache();

  return useQuery(
    ['reveal', 'react-components', 'fdm-asset-mappings', fdmAssetExternalIds],
    async () => {
      return await nodeCacheContent.cache.getMappingsForFdmIds(fdmAssetExternalIds, models);
    },
    {
      enabled: fdmAssetExternalIds.length > 0 && models.length > 0,
      staleTime: DEFAULT_QUERY_STALE_TIME
    }
  );
};

export function NodeCacheProvider({ children }: { children?: ReactNode }): ReactElement {
  const fdmClient = useFdmSdk();
  const cdfClient = useSDK();
  const revealKeepAliveData = useRevealKeepAlive();

  const fdmCache = useMemo(() => {
    const cache = revealKeepAliveData?.fdmNodeCache.current ?? new FdmNodeCache(cdfClient, fdmClient);
    if (revealKeepAliveData !== undefined) {
      revealKeepAliveData.fdmNodeCache.current = cache;
    }
    return cache;
  }, []);

  return (
    <FdmNodeCacheContext.Provider value={{ cache: fdmCache }}>
      {children}
    </FdmNodeCacheContext.Provider>
  );
}
