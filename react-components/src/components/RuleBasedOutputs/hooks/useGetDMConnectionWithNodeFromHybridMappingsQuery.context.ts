import { Context, createContext } from 'react';
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

export const UseGetDMConnectionWithNodeFromHybridMappingsQueryContext: Context<UseGetDMConnectionWithNodeFromHybridMappingsQuery> =
  createContext<UseGetDMConnectionWithNodeFromHybridMappingsQuery>({
    useClassicCadAssetMappingCache,
    useFdmSdk
  });
