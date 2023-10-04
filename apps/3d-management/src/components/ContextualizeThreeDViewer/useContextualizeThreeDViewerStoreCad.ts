import { create } from 'zustand';

import {
  Cognite3DViewer,
  CogniteCadModel,
  CognitePointCloudModel,
  TreeIndexNodeCollection,
} from '@cognite/reveal';
import { AssetMapping3D, ListResponse } from '@cognite/sdk';

import {
  DEFAULT_VISUALIZATION_OPTIONS,
  SelectedNode,
  ToolType,
  VisualizationOptions,
} from './types';

type RootState = {
  isResourceSelectorOpen: boolean;
  isThreeDNodeTreeOpen: boolean;
  threeDViewer: Cognite3DViewer | null;
  tool: ToolType;
  modelId: number | null;
  isModelLoaded: boolean;
  model: CogniteCadModel | CognitePointCloudModel | undefined;
  selectedNodeIdsList: Array<number>;
  selectedAndContextualizedNodesList: Array<SelectedNode>;
  selectedNodesTreeIndex: TreeIndexNodeCollection;
  selectedAndContextualizedNodesTreeIndex: TreeIndexNodeCollection;
  contextualizedNodesTreeIndex: TreeIndexNodeCollection;
  contextualizedNodes: ListResponse<AssetMapping3D[]> | null;
  visualizationOptions: VisualizationOptions;
};

const initialState: RootState = {
  isResourceSelectorOpen: true,
  isThreeDNodeTreeOpen: true,
  threeDViewer: null,
  tool: ToolType.NONE,
  modelId: null,
  isModelLoaded: false,
  model: undefined,
  selectedNodeIdsList: [],
  selectedAndContextualizedNodesList: [],
  selectedNodesTreeIndex: new TreeIndexNodeCollection(),
  selectedAndContextualizedNodesTreeIndex: new TreeIndexNodeCollection(),
  contextualizedNodesTreeIndex: new TreeIndexNodeCollection(),
  contextualizedNodes: null,
  visualizationOptions: DEFAULT_VISUALIZATION_OPTIONS,
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

export const onOpenThreeDNodeTree = () => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    isThreeDNodeTreeOpen: true,
  }));
};

export const onCloseThreeDNodeTree = () => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    isThreeDNodeTreeOpen: false,
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

export const updateVisualizationOptions = (
  visualizationOptions: Partial<VisualizationOptions>
) => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    visualizationOptions: {
      ...prevState.visualizationOptions,
      ...visualizationOptions,
    },
  }));
};

export const setModelType = (modelType: string) => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    modelType,
  }));
};

export const setModel = (model: CogniteCadModel | CognitePointCloudModel) => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    model,
  }));
};

export const setSelectedNodeIdsList = (selectedNodeIdsList: Array<number>) => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    selectedNodeIdsList,
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

export const setSelectedNodesTreeIndex = (
  selectedNodesTreeIndex: TreeIndexNodeCollection
) => {
  useContextualizeThreeDViewerStoreCad.setState((prevState) => ({
    ...prevState,
    selectedNodesTreeIndex,
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
