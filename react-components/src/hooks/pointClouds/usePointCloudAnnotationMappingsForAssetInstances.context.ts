import { Context, createContext } from 'react';
import { usePointCloudAnnotationCache } from '../../components/CacheProvider/CacheProvider';
import { useModelIdRevisionIdFromModelOptions } from '../useModelIdRevisionIdFromModelOptions';

export type UsePointCloudAnnotationMappingsForAssetInstancesDependencies = {
  usePointCloudAnnotationCache: typeof usePointCloudAnnotationCache;
  useModelIdRevisionIdFromModelOptions: typeof useModelIdRevisionIdFromModelOptions;
};

export const defaultUsePointCloudAnnotationMappingsForAssetInstancesDependencies: UsePointCloudAnnotationMappingsForAssetInstancesDependencies =
  {
    usePointCloudAnnotationCache,
    useModelIdRevisionIdFromModelOptions
  };

export const UsePointCloudAnnotationMappingsForAssetInstancesContext: Context<UsePointCloudAnnotationMappingsForAssetInstancesDependencies> =
  createContext<UsePointCloudAnnotationMappingsForAssetInstancesDependencies>(
    defaultUsePointCloudAnnotationMappingsForAssetInstancesDependencies
  );
