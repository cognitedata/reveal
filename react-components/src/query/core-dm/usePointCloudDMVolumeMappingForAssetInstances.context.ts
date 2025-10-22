import { createContext } from 'react';
import { usePointCloudModelRevisionIdsFromReveal } from '../usePointCloudModelRevisionIdsFromReveal';
import { useModelIdRevisionIdFromModelOptions } from '../../hooks/useModelIdRevisionIdFromModelOptions';
import { usePointCloudDMVolumes } from './usePointCloudDMVolumes';
import { useFdmSdk } from '../../components/RevealCanvas/SDKProvider';

export type UsePointCloudDMVolumeMappingForAssetInstancesDependencies = {
  usePointCloudModelRevisionIdsFromReveal: typeof usePointCloudModelRevisionIdsFromReveal;
  useModelIdRevisionIdFromModelOptions: typeof useModelIdRevisionIdFromModelOptions;
  usePointCloudDMVolumes: typeof usePointCloudDMVolumes;
  useFdmSdk: typeof useFdmSdk;
};

export const defaultUsePointCloudDMVolumeMappingForAssetInstancesDependencies: UsePointCloudDMVolumeMappingForAssetInstancesDependencies =
  {
    usePointCloudModelRevisionIdsFromReveal,
    useModelIdRevisionIdFromModelOptions,
    usePointCloudDMVolumes,
    useFdmSdk
  };

export const UsePointCloudDMVolumeMappingForAssetInstancesContext =
  createContext<UsePointCloudDMVolumeMappingForAssetInstancesDependencies>(
    defaultUsePointCloudDMVolumeMappingForAssetInstancesDependencies
  );
