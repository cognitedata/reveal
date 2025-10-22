import { type Context, createContext } from 'react';
import { useFdmSdk } from '../../components/RevealCanvas/SDKProvider';
import { usePointCloudDMVolumeMappingForAssetInstances } from './usePointCloudDMVolumeMappingForAssetInstances';

export type UsePointCloudDMVolumeMappingForIntersectionDependencies = {
  usePointCloudDMVolumeMappingForAssetInstances: typeof usePointCloudDMVolumeMappingForAssetInstances;
  useFdmSdk: typeof useFdmSdk;
};

export const defaultUsePointCloudDMVolumeMappingForIntersectionDependencies: UsePointCloudDMVolumeMappingForIntersectionDependencies =
  {
    usePointCloudDMVolumeMappingForAssetInstances,
    useFdmSdk
  };

export const UsePointCloudDMVolumeMappingForIntersectionContext: Context<UsePointCloudDMVolumeMappingForIntersectionDependencies> =
  createContext<UsePointCloudDMVolumeMappingForIntersectionDependencies>(
    defaultUsePointCloudDMVolumeMappingForIntersectionDependencies
  );
