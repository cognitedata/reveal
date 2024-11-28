/*!
 * Copyright 2024 Cognite AS
 */
import { useMemo, useState } from 'react';
import { CachesDomainObject } from '../../architecture/concrete/caches/CachesDomainObject';
import { useOnUpdateDomainObject } from '../Architecture/useOnUpdate';
import { useRenderTarget } from '../RevealCanvas';
import { type AssetMappingAndNode3DCache } from './AssetMappingAndNode3DCache';
import { type FdmNodeCache } from './FdmNodeCache';
import { type PointCloudAnnotationCache } from './PointCloudAnnotationCache';
import { type Image360AnnotationCache } from './Image360AnnotationCache';

const useCacheObject = (): CachesDomainObject => {
  const revealRenderTarget = useRenderTarget();
  const cacheObj = useMemo<CachesDomainObject>(() => {
    const cachesDomainObject =
      revealRenderTarget.rootDomainObject.getDescendantByType(CachesDomainObject);

    if (cachesDomainObject === undefined) {
      throw Error('CachesDomainObject was not yet initialized in RevealRenderTarget');
    }

    return cachesDomainObject;
  }, [revealRenderTarget]);

  return cacheObj;
};

export const useFdmNodeCache = (): FdmNodeCache => {
  return useCacheObject().fdmNodeCache;
};

export const useAssetMappingAndNode3DCache = (): AssetMappingAndNode3DCache => {
  return useCacheObject().assetMappingAndNode3dCache;
};

export const usePointCloudAnnotationCache = (): PointCloudAnnotationCache => {
  return useCacheObject().pointCloudAnnotationCache;
};

export const useImage360AnnotationCache = (): Image360AnnotationCache => {
  return useCacheObject().image360Cache;
};
