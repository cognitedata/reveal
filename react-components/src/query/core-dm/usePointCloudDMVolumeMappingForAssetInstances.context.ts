import { createContext } from 'react';
import { usePointCloudModelRevisionIdsFromReveal } from '../usePointCloudModelRevisionIdsFromReveal';
import { useModelIdRevisionIdFromModelOptions } from '../../hooks/useModelIdRevisionIdFromModelOptions';
import { usePointCloudDMVolumes } from './usePointCloudDMVolumes';

export type UsePointCloudDMVolumeMappingForAssetInstancesDependencies = {
  usePointCloudModelRevisionIdsFromReveal: typeof usePointCloudModelRevisionIdsFromReveal;
  useModelIdRevisionIdFromModelOptions: typeof useModelIdRevisionIdFromModelOptions;
  usePointCloudDMVolumes: typeof usePointCloudDMVolumes;
};

export const defaultUsePointCloudDMVolumeMappingForAssetInstancesDependencies: UsePointCloudDMVolumeMappingForAssetInstancesDependencies =
  {
    usePointCloudModelRevisionIdsFromReveal,
    useModelIdRevisionIdFromModelOptions,
    usePointCloudDMVolumes
  };

export const UsePointCloudDMVolumeMappingForAssetInstancesContext =
  createContext<UsePointCloudDMVolumeMappingForAssetInstancesDependencies>(
    defaultUsePointCloudDMVolumeMappingForAssetInstancesDependencies
  );
