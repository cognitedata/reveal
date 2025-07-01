import { type CdfCaches } from '../../architecture/base/renderTarget/CdfCaches';
import { useRenderTarget } from '../RevealCanvas';
import { type AssetMappingAndNode3DCache } from './AssetMappingAndNode3DCache';
import { type FdmNodeCache } from './FdmNodeCache';
import { type PointCloudAnnotationCache } from './PointCloudAnnotationCache';
import { type Image360AnnotationCache } from './Image360AnnotationCache';
import { type Fdm3dDataProvider } from '../../data-providers/Fdm3dDataProvider';

const useCacheObject = (): CdfCaches => {
  const revealRenderTarget = useRenderTarget();
  return revealRenderTarget.cdfCaches;
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

export const useFdm3dDataProvider = (): Fdm3dDataProvider => {
  return useCacheObject().fdm3dDataProvider;
};
