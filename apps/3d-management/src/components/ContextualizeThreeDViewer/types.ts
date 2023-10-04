import { DEFAULT_POINT_SIZE } from '@3d-management/pages/ContextualizeEditor/constants';

import { PointColorType } from '@cognite/reveal';

export type ThreeDPosition = {
  x: number;
  y: number;
  z: number;
};

export type CubeAnnotation = {
  position: ThreeDPosition;
  size: ThreeDPosition;
};

export type VisualizationOptions = {
  pointSize: number;
  pointColor: PointColorType;
};

export const DEFAULT_VISUALIZATION_OPTIONS: VisualizationOptions = {
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

export enum ThreeDModelType {
  NONE = 'none',
  CAD = 'cad',
  POINT_CLOUD = 'pointcloud',
}

export type SelectedNode = {
  treeIndex: number;
  nodeId: number;
};
