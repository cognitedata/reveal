import { create } from 'zustand';

import {
  Cognite3DViewer,
  CogniteCadModel,
  TreeIndexNodeCollection,
} from '@cognite/reveal';
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
  model: CogniteCadModel | null;
  revisionId: number | null;
  isModelLoaded: boolean;
  selectedNodeIds: Array<number>;
  contextualizedNodes: AssetMapping3D[] | null;
  selectedNodeIdsStyleIndex: TreeIndexNodeCollection;
  contextualizedNodesStyleIndex: TreeIndexNodeCollection;
  highlightedNodeIdsStyleIndex: TreeIndexNodeCollection;
  hoveredAnnotationByAssetId: number | null;
};

const initialState: RootState = {
  isResourceSelectorOpen: true,
  threeDViewer: null,
  tool: ToolType.ADD_ANNOTATION,
  modelId: null,
  model: null,
  revisionId: null,
  isModelLoaded: false,
  selectedNodeIds: [],
  contextualizedNodes: null,
  selectedNodeIdsStyleIndex: new TreeIndexNodeCollection(),
  contextualizedNodesStyleIndex: new TreeIndexNodeCollection(),
  highlightedNodeIdsStyleIndex: new TreeIndexNodeCollection(),
  hoveredAnnotationByAssetId: null,
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

export const setModel = (model: CogniteCadModel) => {
  useCadContextualizeStore.setState((prevState) => ({
    ...prevState,
    model,
  }));
};

export const setRevisionId = (revisionId: number) => {
  useCadContextualizeStore.setState((prevState) => ({
    ...prevState,
    revisionId,
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

export const setHighlightedNodeIdsStyleIndex = (
  highlightedNodeIdsStyleIndex: TreeIndexNodeCollection
) => {
  useCadContextualizeStore.setState((prevState) => ({
    ...prevState,
    highlightedNodeIdsStyleIndex,
  }));
};

// TODO: we will keep the same naming as for PCs for now to keep consistency. We will change it once we define a proper naming
export const setHoveredAnnotation = (
  hoveredAnnotationByAssetId: number | null
) => {
  useCadContextualizeStore.setState((prevState) => ({
    ...prevState,
    hoveredAnnotationByAssetId: hoveredAnnotationByAssetId,
  }));
};

export const resetCadContextualizeThreeDViewerStore = () => {
  useCadContextualizeStore.setState(initialState);
};
