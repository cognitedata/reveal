import { createContext } from 'react';
import { useFdm3dNodeDataPromises, useAssetMappingForTreeIndex } from './cad';
import { usePointCloudAnnotationMappingForIntersection } from './pointClouds/usePointCloudAnnotationMappingForIntersection';
import { usePointCloudFdmVolumeMappingForIntersection } from '../query/core-dm/usePointCloudDMVolumeMappingForAssetInstances';
import { useRenderTarget, useReveal } from '../components/RevealCanvas/ViewerContext';
import { isActiveEditTool } from '../architecture/base/commands/BaseEditTool';

export type UseClickedNodeDataDependencies = {
  useFdm3dNodeDataPromises: typeof useFdm3dNodeDataPromises;
  useAssetMappingForTreeIndex: typeof useAssetMappingForTreeIndex;
  usePointCloudAnnotationMappingForIntersection: typeof usePointCloudAnnotationMappingForIntersection;
  usePointCloudFdmVolumeMappingForIntersection: typeof usePointCloudFdmVolumeMappingForIntersection;
  useRenderTarget: typeof useRenderTarget;
  useReveal: typeof useReveal;
  isActiveEditTool: typeof isActiveEditTool;
};

export const defaultUseClickedNodeDataDependencies: UseClickedNodeDataDependencies = {
  useFdm3dNodeDataPromises,
  useAssetMappingForTreeIndex,
  usePointCloudAnnotationMappingForIntersection,
  usePointCloudFdmVolumeMappingForIntersection,
  useRenderTarget,
  useReveal,
  isActiveEditTool
};

export const UseClickedNodeDataContext = createContext<UseClickedNodeDataDependencies>(
  defaultUseClickedNodeDataDependencies
);
