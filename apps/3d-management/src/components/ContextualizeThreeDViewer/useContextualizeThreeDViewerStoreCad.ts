import { create } from 'zustand';

import { Cognite3DViewer, TreeIndexNodeCollection } from '@cognite/reveal';
import { AssetMapping3D, ListResponse } from '@cognite/sdk';

import { SelectedNode } from './types';

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
  selectedAndContextualizedNodesList: Array<SelectedNode>;
  selectedAndContextualizedNodesTreeIndex: TreeIndexNodeCollection;
  contextualizedNodesTreeIndex: TreeIndexNodeCollection;
  contextualizedNodes: ListResponse<AssetMapping3D[]> | null;
};

const initialState: RootState = {
  isResourceSelectorOpen: true,
  threeDViewer: null,
  tool: ToolType.ADD_ANNOTATION,
  modelId: null,
  isModelLoaded: false,
  selectedNodeIds: [],
  selectedAndContextualizedNodesList: [],
  selectedAndContextualizedNodesTreeIndex: new TreeIndexNodeCollection(),
  contextualizedNodesTreeIndex: new TreeIndexNodeCollection(),
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

export const setSelectedAndContextualizedNodesList = (
  selectedAndContextualizedNodesList: Array<SelectedNode>
) => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    selectedAndContextualizedNodesList,
  }));
};

export const setSelectedAndContextualizedNodesTreeIndex = (
  selectedAndContextualizedNodesTreeIndex: TreeIndexNodeCollection
) => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    selectedAndContextualizedNodesTreeIndex,
  }));
};

export const setContextualizedNodesTreeIndex = (
  contextualizedNodesTreeIndex: TreeIndexNodeCollection
) => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    contextualizedNodesTreeIndex,
  }));
};

export const setContextualizedNodes = (
  contextualizedNodes: ListResponse<AssetMapping3D[]>
) => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    contextualizedNodes,
  }));
};
