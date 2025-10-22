import { type Context, createContext } from 'react';
import { useFdmSdk, useSDK } from '../components/RevealCanvas/SDKProvider';
import { getPointCloudModelsForAssetInstance } from '../hooks/network/getPointCloudModelsForAssetInstance';
import { getCadModelsForHybridDmInstance } from '../hooks/network/getCadModelsForHybridDmInstance';
import { useFdm3dDataProvider } from '../components/CacheProvider/CacheProvider';
import { useIsCoreDmOnly } from '../hooks/useIsCoreDmOnly';
import { getCadModelsForAsset } from '../hooks/network/getCadModelsForAsset';
import { getPointCloudModelsForAsset } from '../hooks/network/getPointCloudModelsForAsset';
import { getImage360CollectionsForAsset } from '../hooks/network/getImage360CollectionsForAsset';

export type ModelsForInstanceQueryDependencies = {
  useSDK: typeof useSDK;
  useFdmSdk: typeof useFdmSdk;
  useFdm3dDataProvider: typeof useFdm3dDataProvider;
  useIsCoreDmOnly: typeof useIsCoreDmOnly;
  getPointCloudModelsForAssetInstance: typeof getPointCloudModelsForAssetInstance;
  getCadModelsForHybridDmInstance: typeof getCadModelsForHybridDmInstance;
  getCadModelsForAsset: typeof getCadModelsForAsset;
  getPointCloudModelsForAsset: typeof getPointCloudModelsForAsset;
  getImage360CollectionsForAsset: typeof getImage360CollectionsForAsset;
};

export const defaultModelsForInstanceQueryDependencies: ModelsForInstanceQueryDependencies = {
  useFdmSdk,
  useSDK,
  useFdm3dDataProvider,
  useIsCoreDmOnly,
  getPointCloudModelsForAssetInstance,
  getCadModelsForHybridDmInstance,
  getCadModelsForAsset,
  getPointCloudModelsForAsset,
  getImage360CollectionsForAsset
};

export const UseModelsForInstanceQueryContext: Context<ModelsForInstanceQueryDependencies> =
  createContext<ModelsForInstanceQueryDependencies>(defaultModelsForInstanceQueryDependencies);
