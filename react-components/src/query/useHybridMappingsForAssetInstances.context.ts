import { createContext } from 'react';
import { useClassicCadAssetMappingCache } from '../components/CacheProvider/CacheProvider';

export type UseHybridMappingsForAssetInstancesDependencies = {
  useClassicCadAssetMappingCache: typeof useClassicCadAssetMappingCache;
};

export const defaultUseHybridMappingsForAssetInstancesDependencies: UseHybridMappingsForAssetInstancesDependencies =
  {
    useClassicCadAssetMappingCache
  };

export const UseHybridMappingsForAssetInstancesContext =
  createContext<UseHybridMappingsForAssetInstancesDependencies>({
    useClassicCadAssetMappingCache
  });
