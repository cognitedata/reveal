import { Context, createContext } from 'react';
import { usePointCloudAnnotationCache } from '../../components/CacheProvider/CacheProvider';
import { fetchAnnotationsForModel } from './fetchAnnotationsForModel';

export type UsePointCloudAnnotationMappingForIntersectionDependencies = {
  usePointCloudAnnotationCache: typeof usePointCloudAnnotationCache;
  fetchAnnotationsForModel: typeof fetchAnnotationsForModel;
};

export const defaultUsePointCloudAnnotationMappingForIntersectionDependencies: UsePointCloudAnnotationMappingForIntersectionDependencies =
  {
    usePointCloudAnnotationCache,
    fetchAnnotationsForModel
  };

export const UsePointCloudAnnotationMappingForIntersectionContext: Context<UsePointCloudAnnotationMappingForIntersectionDependencies> =
  createContext<UsePointCloudAnnotationMappingForIntersectionDependencies>(
    defaultUsePointCloudAnnotationMappingForIntersectionDependencies
  );
