import { create } from 'zustand';

import { Cognite3DViewer } from '@cognite/reveal';
export type ThreeDPosition = {
  x: number;
  y: number;
  z: number;
};

export type CubeAnnotation = {
  position: ThreeDPosition;
  size: ThreeDPosition;
};

export enum ToolType {
  NONE = 'none',
  ADD_ANNOTATION = 'addAnnotation',
  DELETE_ANNOTATION = 'deleteAnnotation',
  ADD_THREEDNODE_ASSET_MAPPING = 'addThreeDNodeAssetMapping',
  DELETE_THREEDNODE_ASSET_MAPPING = 'deleteThreeDNodeAssetMapping',
}

type RootState = {
  pendingAnnotation: CubeAnnotation | null;
  isResourceSelectorOpen: boolean;
  isThreeDNodeTreeOpen: boolean;
  threeDViewer: Cognite3DViewer | null;
  tool: ToolType;
  shouldShowBoundingVolumes: boolean;
  modelId: number | null;
  isToolbarForCadModels: boolean;
  isToolbarForPointCloudModels: boolean;
};

const initialState: RootState = {
  pendingAnnotation: null,
  isResourceSelectorOpen: false,
  isThreeDNodeTreeOpen: false,
  isToolbarForCadModels: false,
  isToolbarForPointCloudModels: false,
  threeDViewer: null,
  tool: ToolType.NONE,
  shouldShowBoundingVolumes: false,
  modelId: null,
};

export const useContextualizeThreeDViewerStore = create<RootState>(
  () => initialState
);

export const onOpenResourceSelector = () => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    isResourceSelectorOpen: true,
  }));
};

export const onCloseResourceSelector = () => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    isResourceSelectorOpen: false,
    pendingAnnotation: null,
  }));
};

export const onOpenThreeDNodeTree = () => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    isThreeDNodeTreeOpen: true,
  }));
};

export const onCloseThreeDNodeTree = () => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    isThreeDNodeTreeOpen: false,
  }));
};

export const setPendingAnnotation = (annotation: CubeAnnotation) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    pendingAnnotation: annotation,
  }));
};

export const setThreeDViewer = (model: Cognite3DViewer) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    threeDViewer: model,
  }));
};

export const setTool = (tool: ToolType) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    tool,
    pendingAnnotation: null,
    isResourceSelectorOpen: false,
  }));
};

export const setToolbarForCadModelsState = () => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    isToolbarForCadModels: true,
  }));
};

export const setToolbarForPointCloudModelsState = () => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    isToolbarForPointCloudModels: true,
  }));
};

export const toggleShouldShowBoundingVolumes = () => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    shouldShowBoundingVolumes: !prevState.shouldShowBoundingVolumes,
  }));
};

export const setModelId = (modelId: number) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    modelId,
  }));
};
