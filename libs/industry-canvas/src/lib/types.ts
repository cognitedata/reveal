import { Annotation } from '@cognite/unified-file-viewer';

export enum ContainerReferenceType {
  FILE = 'file',
  TIMESERIES = 'timeseries',
  ASSET = 'asset',
}

export type Dimensions = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
};

export type FileContainerReferenceWithoutDimensions = {
  type: ContainerReferenceType.FILE;
  id: number;
  page: number;
};

export type AssetContaienrReferenceWithoutDimensions = {
  type: ContainerReferenceType.ASSET;
  id: number;
};

export type FileContainerReference = FileContainerReferenceWithoutDimensions &
  Dimensions;

export type TimeseriesContainerReferenceWithoutDimensions = {
  type: ContainerReferenceType.TIMESERIES;
  id: number;
  startDate: Date;
  endDate: Date;
};

export type TimeseriesContainerReference =
  TimeseriesContainerReferenceWithoutDimensions & Dimensions;

export type AssetContainerReference = AssetContaienrReferenceWithoutDimensions &
  Dimensions;

export type ContainerReferenceWithoutDimensions =
  | FileContainerReferenceWithoutDimensions
  | TimeseriesContainerReferenceWithoutDimensions
  | AssetContaienrReferenceWithoutDimensions;

export type ContainerReference =
  | FileContainerReference
  | TimeseriesContainerReference
  | AssetContainerReference;

// Maybe we need to add some metadata etc here in the future
export type CanvasAnnotation = Annotation;

export type CanvasState = {
  containerReferences: ContainerReference[];
  canvasAnnotations: CanvasAnnotation[];
};

export enum ShapeAnnotationColor {
  BLUE = 'blue',
  GREEN = 'green',
  ORANGE = 'orange',
  RED = 'red',
  YELLOW = 'yellow',
}
