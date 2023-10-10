import { create } from 'zustand';

import { Cognite3DViewer, TreeIndexNodeCollection } from '@cognite/reveal';
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
  selectedNodeIdsStyleIndex: TreeIndexNodeCollection;
  contextualizedNodesStyleIndex: TreeIndexNodeCollection;
};

const initialState: RootState = {
  isResourceSelectorOpen: true,
  threeDViewer: null,
  tool: ToolType.ADD_ANNOTATION,
  modelId: null,
  isModelLoaded: false,
  selectedNodeIds: [],
  contextualizedNodes: null,
  selectedNodeIdsStyleIndex: new TreeIndexNodeCollection(),
  contextualizedNodesStyleIndex: new TreeIndexNodeCollection(),
};

export const useCadContextualizeStore = create<RootState>(() => initialState);

export const onOpenResourceSelector = () => {
  useCadContextualizeStore.setState((prevState) => ({
    ...prevState,
    isResourceSelectorOpen: true,
  }));
};

export const onCloseResourceSelector = () => {
  useCadContextualizeStore.setState((prevState) => ({
    ...prevState,
    isResourceSelectorOpen: false,
    pendingAnnotation: null,
  }));
};

export const setThreeDViewer = (viewer: Cognite3DViewer) => {
  useCadContextualizeStore.setState((prevState) => ({
    ...prevState,
    threeDViewer: viewer,
  }));
};

export const setModelLoaded = () => {
  useCadContextualizeStore.setState((prevState) => ({
    ...prevState,
    isModelLoaded: true,
  }));
};

export const setTool = (tool: ToolType) => {
  useCadContextualizeStore.setState((prevState) => ({
    ...prevState,
    tool,
    pendingAnnotation: null,
  }));
};

export const setModelId = (modelId: number) => {
  useCadContextualizeStore.setState((prevState) => ({
    ...prevState,
    modelId,
  }));
};

export const setSelectedNodeIds = (selectedNodeIds: Array<number>) => {
  useCadContextualizeStore.setState((prevState) => ({
    ...prevState,
    selectedNodeIds: selectedNodeIds,
  }));
};

export const setContextualizedNodes = (
  contextualizedNodes: AssetMapping3D[]
) => {
  useCadContextualizeStore.setState((prevState) => ({
    ...prevState,
    contextualizedNodes,
  }));
};

export const setSelectedNodeIdsStyleIndex = (
  selectedNodeIdsStyleIndex: TreeIndexNodeCollection
) => {
  useCadContextualizeStore.setState((prevState) => ({
    ...prevState,
    selectedNodeIdsStyleIndex: selectedNodeIdsStyleIndex,
  }));
};

export const setContextualizedNodesStyleIndex = (
  contextualizedNodesStyleIndex: TreeIndexNodeCollection
) => {
  useCadContextualizeStore.setState((prevState) => ({
    ...prevState,
    contextualizedNodesStyleIndex,
  }));
};
