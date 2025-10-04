import { createContext } from 'react';
import { getInstanceDataFromIntersection } from './getInstanceDataFromIntersection';
import { usePointCloudAnnotationCache } from '../../components/CacheProvider/CacheProvider';
import { fetchAnnotationsForModel } from './fetchAnnotationsForModel';

export type UsePointCloudAnnotationMappingForIntersectionDependencies = {
  getInstanceDataFromIntersection: typeof getInstanceDataFromIntersection;
  usePointCloudAnnotationCache: typeof usePointCloudAnnotationCache;
  fetchAnnotationsForModel: typeof fetchAnnotationsForModel;
};

export const defaultUsePointCloudAnnotationMappingForIntersectionDependencies: UsePointCloudAnnotationMappingForIntersectionDependencies =
  {
    getInstanceDataFromIntersection,
    usePointCloudAnnotationCache,
    fetchAnnotationsForModel,
  };

export const UsePointCloudAnnotationMappingForIntersectionContext =
  createContext<UsePointCloudAnnotationMappingForIntersectionDependencies>(
    defaultUsePointCloudAnnotationMappingForIntersectionDependencies
  );
