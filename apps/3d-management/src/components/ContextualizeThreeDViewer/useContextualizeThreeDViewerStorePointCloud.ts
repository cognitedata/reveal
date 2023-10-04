import { create } from 'zustand';

import {
  Cognite3DViewer,
  CogniteCadModel,
  CognitePointCloudModel,
  TreeIndexNodeCollection,
  PointColorType,
} from '@cognite/reveal';
import { AnnotationModel, AssetMapping3D, ListResponse } from '@cognite/sdk';

import { DEFAULT_POINT_SIZE } from '../../pages/ContextualizeEditor/constants';

import { SelectedNode } from './types';

export type ThreeDPosition = {
  x: number;
  y: number;
  z: number;
};

export type CubeAnnotation = {
  position: ThreeDPosition;
  size: ThreeDPosition;
};

type VisualizationOptions = { pointSize: number; pointColor: PointColorType };
const DEFAULT_VISUALIZATION_OPTIONS: VisualizationOptions = {
  pointSize: DEFAULT_POINT_SIZE,
  pointColor: PointColorType.Rgb,
};

export enum ToolType {
  NONE = 'none',
  ADD_ANNOTATION = 'addAnnotation',
  DELETE_ANNOTATION = 'deleteAnnotation',
  ADD_THREEDNODE_MAPPING = 'addThreeDNodeMapping',
  DELETE_THREEDNODE_MAPPING = 'deleteThreeDNodeMapping',
}

type RootState = {
  pendingAnnotation: CubeAnnotation | null;
  isResourceSelectorOpen: boolean;
  isThreeDNodeTreeOpen: boolean;
  threeDViewer: Cognite3DViewer | null;
  tool: ToolType;
  shouldShowBoundingVolumes: boolean;
  shouldShowWireframes: boolean;
  modelId: number | null;
  isModelLoaded: boolean;
  isToolbarForCadModels: boolean;
  isToolbarForPointCloudModels: boolean;
  model: CogniteCadModel | CognitePointCloudModel | undefined;
  annotations: AnnotationModel[] | null;
  visualizationOptions: VisualizationOptions;
};

const initialState: RootState = {
  pendingAnnotation: null,
  isResourceSelectorOpen: true,
  isThreeDNodeTreeOpen: true,
  isToolbarForCadModels: false,
  isToolbarForPointCloudModels: false,
  threeDViewer: null,
  tool: ToolType.NONE,
  shouldShowBoundingVolumes: false,
  shouldShowWireframes: true,
  modelId: null,
  isModelLoaded: false,
  model: undefined,
  annotations: null,
  visualizationOptions: DEFAULT_VISUALIZATION_OPTIONS,
};

export const useContextualizeThreeDViewerStorePointCloud = create<RootState>(
  () => initialState
);

export const onOpenResourceSelector = () => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    isResourceSelectorOpen: true,
  }));
};

export const onCloseResourceSelector = () => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    isResourceSelectorOpen: false,
    pendingAnnotation: null,
  }));
};

export const onOpenThreeDNodeTree = () => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    isThreeDNodeTreeOpen: true,
  }));
};

export const onCloseThreeDNodeTree = () => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    isThreeDNodeTreeOpen: false,
  }));
};

export const setPendingAnnotation = (annotation: CubeAnnotation | null) => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    pendingAnnotation: annotation,
    isResourceSelectorOpen:
      annotation !== null || prevState.isResourceSelectorOpen,
  }));
};

export const setThreeDViewer = (viewer: Cognite3DViewer) => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    threeDViewer: viewer,
  }));
};

export const setModelLoaded = () => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    isModelLoaded: true,
  }));
};

export const setTool = (tool: ToolType) => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    tool,
    pendingAnnotation: null,
  }));
};

export const setToolbarForPointCloudModelsState = () => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    isToolbarForPointCloudModels: true,
  }));
};

export const setAnnotations = (annotations: AnnotationModel[]) => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    annotations: annotations,
  }));
};

export const toggleShouldShowBoundingVolumes = () => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    shouldShowBoundingVolumes: !prevState.shouldShowBoundingVolumes,
  }));
};

export const toggleShouldShowWireframes = () => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    shouldShowWireframes: !prevState.shouldShowWireframes,
  }));
};

export const setModelId = (modelId: number) => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    modelId,
  }));
};

export const updateVisualizationOptions = (
  visualizationOptions: Partial<VisualizationOptions>
) => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    visualizationOptions: {
      ...prevState.visualizationOptions,
      ...visualizationOptions,
    },
  }));
};

export const setModel = (model: CogniteCadModel | CognitePointCloudModel) => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    model,
  }));
};
