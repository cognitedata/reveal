import { create } from 'zustand';

import { Cognite3DViewer } from '@cognite/reveal';
import { AnnotationModel } from '@cognite/sdk';
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
}

type RootState = {
  pendingAnnotation: CubeAnnotation | null;
  isResourceSelectorOpen: boolean;
  threeDViewer: Cognite3DViewer | null;
  tool: ToolType;
  shouldShowBoundingVolumes: boolean;
  shouldShowWireframes: boolean;
  modelId: number | null;
  isToolbarForCadModels: boolean;
  isToolbarForPointCloudModels: boolean;
  annotations: AnnotationModel[] | null;
};

const initialState: RootState = {
  pendingAnnotation: null,
  isResourceSelectorOpen: true,
  isToolbarForCadModels: false,
  isToolbarForPointCloudModels: false,
  threeDViewer: null,
  tool: ToolType.NONE,
  shouldShowBoundingVolumes: false,
  shouldShowWireframes: false,
  modelId: null,
  annotations: null,
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

export const setPendingAnnotation = (annotation: CubeAnnotation | null) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    pendingAnnotation: annotation,
    isResourceSelectorOpen:
      annotation !== null || prevState.isResourceSelectorOpen,
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

export const setAnnotations = (annotations: AnnotationModel[]) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    annotations: annotations,
  }));
};

export const toggleShouldShowBoundingVolumes = () => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    shouldShowBoundingVolumes: !prevState.shouldShowBoundingVolumes,
  }));
};

export const toggleShouldShowWireframes = () => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    shouldShowWireframes: !prevState.shouldShowWireframes,
  }));
};

export const setModelId = (modelId: number) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    modelId,
  }));
};
