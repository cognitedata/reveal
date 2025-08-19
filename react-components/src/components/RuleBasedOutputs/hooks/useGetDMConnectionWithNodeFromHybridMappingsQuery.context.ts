import { createContext } from 'react';
import { useClassicCadAssetMappingCache } from '../../CacheProvider/CacheProvider';
import { useFdmSdk } from '../../RevealCanvas/SDKProvider';

export type UseGetDMConnectionWithNodeFromHybridMappingsQuery = {
  useClassicCadAssetMappingCache: typeof useClassicCadAssetMappingCache;
  useFdmSdk: typeof useFdmSdk;
};

export const defaultUseGetDMConnectionWithNodeFromHybridMappingsQuery: UseGetDMConnectionWithNodeFromHybridMappingsQuery =
  {
    useClassicCadAssetMappingCache,
    useFdmSdk
  };

export const UseGetDMConnectionWithNodeFromHybridMappingsQueryContext =
  createContext<UseGetDMConnectionWithNodeFromHybridMappingsQuery>({
    useClassicCadAssetMappingCache,
    useFdmSdk
  });
