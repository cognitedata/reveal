import { Context, createContext } from 'react';
import { useFdm3dNodeDataPromises, useAssetMappingForTreeIndex } from './cad';
import { usePointCloudAnnotationMappingForIntersection } from './pointClouds/usePointCloudAnnotationMappingForIntersection';
import { usePointCloudDMVolumeMappingForIntersection } from '../query/core-dm/usePointCloudDMVolumeMappingForIntersection';
import { useRenderTarget, useReveal } from '../components/RevealCanvas/ViewerContext';
import { isActiveEditTool } from '../architecture/base/commands/BaseEditTool';

export type UseClickedNodeDataDependencies = {
  useFdm3dNodeDataPromises: typeof useFdm3dNodeDataPromises;
  useAssetMappingForTreeIndex: typeof useAssetMappingForTreeIndex;
  usePointCloudAnnotationMappingForIntersection: typeof usePointCloudAnnotationMappingForIntersection;
  usePointCloudDMVolumeMappingForIntersection: typeof usePointCloudDMVolumeMappingForIntersection;
  useRenderTarget: typeof useRenderTarget;
  useReveal: typeof useReveal;
  isActiveEditTool: typeof isActiveEditTool;
};

export const defaultUseClickedNodeDataDependencies: UseClickedNodeDataDependencies = {
  useFdm3dNodeDataPromises,
  useAssetMappingForTreeIndex,
  usePointCloudAnnotationMappingForIntersection,
  usePointCloudDMVolumeMappingForIntersection,
  useRenderTarget,
  useReveal,
  isActiveEditTool
};

export const UseClickedNodeDataContext: Context<UseClickedNodeDataDependencies> = createContext<UseClickedNodeDataDependencies>(
  defaultUseClickedNodeDataDependencies
);
