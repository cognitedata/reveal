import { createContext } from 'react';
import { getInstanceDataFromIntersection } from './getInstanceDataFromIntersection';
import { usePointCloudAnnotationCache } from '../../components/CacheProvider/CacheProvider';
import { fetchAnnotationsForModel } from './fetchAnnotationsForModel';

export type UsePointCloudAnnotationMappingForAssetIdDependencies = {
  getInstanceDataFromIntersection: typeof getInstanceDataFromIntersection;
  usePointCloudAnnotationCache: typeof usePointCloudAnnotationCache;
  fetchAnnotationsForModel: typeof fetchAnnotationsForModel;
};

export const defaultUsePointCloudAnnotationMappingForAssetIdDependencies: UsePointCloudAnnotationMappingForAssetIdDependencies =
  {
    getInstanceDataFromIntersection,
    usePointCloudAnnotationCache,
    fetchAnnotationsForModel,
  };

export const UsePointCloudAnnotationMappingForAssetIdContext =
  createContext<UsePointCloudAnnotationMappingForAssetIdDependencies>(
    defaultUsePointCloudAnnotationMappingForAssetIdDependencies
  );
