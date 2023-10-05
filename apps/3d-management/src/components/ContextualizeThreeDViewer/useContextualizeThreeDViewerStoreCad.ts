import { create } from 'zustand';

import { Cognite3DViewer } from '@cognite/reveal';
import { AssetMapping3D } from '@cognite/sdk';

// TODO: Improve naming of the tools
export enum ToolType {
  ADD_ANNOTATION = 'addAnnotation',
  DELETE_ANNOTATION = 'deleteAnnotation',
}

type RootState = {
  isResourceSelectorOpen: boolean;
  threeDViewer: Cognite3DViewer | null;
  tool: ToolType;
  modelId: number | null;
  isModelLoaded: boolean;
  selectedNodeIds: Array<number>;
  contextualizedNodes: AssetMapping3D[] | null;
};

const initialState: RootState = {
  isResourceSelectorOpen: true,
  threeDViewer: null,
  tool: ToolType.ADD_ANNOTATION,
  modelId: null,
  isModelLoaded: false,
  selectedNodeIds: [],
  contextualizedNodes: null,
};

export const useContextualizeThreeDViewerStoreCad = create<RootState>(
  () => initialState
);

export const onOpenResourceSelector = () => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    isResourceSelectorOpen: true,
  }));
};

export const onCloseResourceSelector = () => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    isResourceSelectorOpen: false,
    pendingAnnotation: null,
  }));
};

export const setThreeDViewer = (viewer: Cognite3DViewer) => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    threeDViewer: viewer,
  }));
};

export const setModelLoaded = () => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    isModelLoaded: true,
  }));
};

export const setTool = (tool: ToolType) => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    tool,
    pendingAnnotation: null,
  }));
};

export const setModelId = (modelId: number) => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    modelId,
  }));
};

export const setSelectedNodeIds = (selectedNodeIds: Array<number>) => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    selectedNodeIds: selectedNodeIds,
  }));
};

export const setContextualizedNodes = (
  contextualizedNodes: AssetMapping3D[]
) => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    contextualizedNodes,
  }));
};
