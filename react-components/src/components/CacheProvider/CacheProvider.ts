import { type CdfCaches } from '../../architecture/base/renderTarget/CdfCaches';
import { useRenderTarget } from '../RevealCanvas';
import { type ClassicCadAssetMappingCache } from './cad/ClassicAssetMappingCache';
import { type FdmCadNodeCache } from './cad/FdmCadNodeCache';
import { type PointCloudAnnotationCache } from './PointCloudAnnotationCache';
import { type Image360AnnotationCache } from './Image360AnnotationCache';
import { type Fdm3dDataProvider } from '../../data-providers/Fdm3dDataProvider';

const useCacheObject = (): CdfCaches => {
  const revealRenderTarget = useRenderTarget();
  return revealRenderTarget.cdfCaches;
};

export const useFdmCadNodeCache = (): FdmCadNodeCache | undefined => {
  return useCacheObject().fdmCadNodeCache;
};

export const useClassicCadAssetMappingCache = (): ClassicCadAssetMappingCache => {
  return useCacheObject().classicCadAssetMappingCache;
};

export const usePointCloudAnnotationCache = (): PointCloudAnnotationCache => {
  return useCacheObject().pointCloudAnnotationCache;
};

export const useImage360AnnotationCache = (): Image360AnnotationCache => {
  return useCacheObject().image360Cache;
};

export const useFdm3dDataProvider = (): Fdm3dDataProvider | undefined => {
  return useCacheObject().fdm3dDataProvider;
};
