import { create } from 'zustand';

import {
  Cognite3DViewer,
  CogniteCadModel,
  CognitePointCloudModel,
  TreeIndexNodeCollection,
} from '@cognite/reveal';
import { AnnotationModel, AssetMapping3D, ListResponse } from '@cognite/sdk';

import { SelectedNode } from './components/Cad/CadContextualizeThreeDViewer';
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
  isToolbarForCadModels: boolean;
  isToolbarForPointCloudModels: boolean;
  model: CogniteCadModel | CognitePointCloudModel | undefined;
  modelType: string;
  selectedNodeIdsList: Array<number>;
  selectedAndContextualizedNodesList: Array<SelectedNode>;
  selectedAndContextualizedNodes: TreeIndexNodeCollection;
  contextualizedNodes: ListResponse<AssetMapping3D[]> | null;
  annotations: AnnotationModel[] | null;
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
  shouldShowWireframes: false,
  modelId: null,
  model: undefined,
  modelType: '',
  selectedNodeIdsList: [],
  selectedAndContextualizedNodesList: [],
  selectedAndContextualizedNodes: new TreeIndexNodeCollection(),
  contextualizedNodes: null,
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

export const setPendingAnnotation = (annotation: CubeAnnotation | null) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    pendingAnnotation: annotation,
    isResourceSelectorOpen:
      annotation !== null || prevState.isResourceSelectorOpen,
  }));
};

export const setThreeDViewer = (viewer: Cognite3DViewer) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    threeDViewer: viewer,
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

export const setModelType = (modelType: string) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    modelType,
  }));
};

export const setModel = (model: CogniteCadModel | CognitePointCloudModel) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    model,
  }));
};

export const setSelectedNodeIdsList = (selectedNodeIdsList: Array<number>) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    selectedNodeIdsList,
  }));
};

export const setSelectedAndContextualizedNodesList = (
  selectedAndContextualizedNodesList: Array<SelectedNode>
) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    selectedAndContextualizedNodesList,
  }));
};

export const setSelectedAndContextualizedTreeIndexCollection = (
  selectedAndContextualizedNodes: TreeIndexNodeCollection
) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    selectedAndContextualizedNodes,
  }));
};

export const setContextualizedNodes = (
  contextualizedNodes: ListResponse<AssetMapping3D[]>
) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    contextualizedNodes,
  }));
};
