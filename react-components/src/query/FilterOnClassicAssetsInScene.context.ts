import { createContext } from 'react';
import { useReveal3dResourcesFromScene } from '../hooks';
import { useAllAssetsMapped360Annotations } from './useSearchAssetsMapped360Annotations';
import { useAllAssetsMappedPointCloudAnnotations } from './useSearchAssetsMappedPointCloudAnnotations';
import { useAllMappedEquipmentAssetMappings } from './useSearchMappedEquipmentAssetMappings';

export type FilterOnClassicAssetsInSceneDependencies = {
  useReveal3dResourcesFromScene: typeof useReveal3dResourcesFromScene;
  useAllMappedEquipmentAssetMappings: typeof useAllMappedEquipmentAssetMappings;
  useAllAssetsMapped360Annotations: typeof useAllAssetsMapped360Annotations;
  useAllAssetsMappedPointCloudAnnotations: typeof useAllAssetsMappedPointCloudAnnotations;
};

export const FilterOnClassicAssetsInSceneContext =
  createContext<FilterOnClassicAssetsInSceneDependencies>({
    useReveal3dResourcesFromScene,
    useAllMappedEquipmentAssetMappings,
    useAllAssetsMapped360Annotations,
    useAllAssetsMappedPointCloudAnnotations
  });
