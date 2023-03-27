import { Annotation } from '@cognite/unified-file-viewer';

export enum ContainerReferenceType {
  FILE = 'file',
  TIMESERIES = 'timeseries',
  ASSET = 'asset',
  THREE_D = 'threeD',
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
  id: string;
  resourceId: number;
  page: number;
};

export type AssetContaienrReferenceWithoutDimensions = {
  type: ContainerReferenceType.ASSET;
  id: string;
  resourceId: number;
};

export type ThreeDContainerReferenceWithoutDimensions = {
  id: string;
  type: ContainerReferenceType.THREE_D;
  modelId: number;
  revisionId: number;
  initialAssetId?: number;
  camera?: {
    position: {
      x: number;
      y: number;
      z: number;
    };
    target: {
      x: number;
      y: number;
      z: number;
    };
  };
};

export type FileContainerReference = FileContainerReferenceWithoutDimensions &
  Dimensions;

export type TimeseriesContainerReferenceWithoutDimensions = {
  type: ContainerReferenceType.TIMESERIES;
  id: string;
  resourceId: number;
  startDate: Date;
  endDate: Date;
};

export type TimeseriesContainerReference =
  TimeseriesContainerReferenceWithoutDimensions & Dimensions;

export type AssetContainerReference = AssetContaienrReferenceWithoutDimensions &
  Dimensions;

export type ThreeDContainerReference =
  ThreeDContainerReferenceWithoutDimensions & Dimensions;

export type ContainerReferenceWithoutDimensions =
  | FileContainerReferenceWithoutDimensions
  | TimeseriesContainerReferenceWithoutDimensions
  | AssetContaienrReferenceWithoutDimensions
  | ThreeDContainerReferenceWithoutDimensions;

export type ContainerReference =
  | FileContainerReference
  | TimeseriesContainerReference
  | AssetContainerReference
  | ThreeDContainerReference;

// Maybe we need to add some metadata etc here in the future
export type CanvasAnnotation = Annotation;

export type CanvasState = {
  containerReferences: ContainerReference[];
  canvasAnnotations: CanvasAnnotation[];
};
