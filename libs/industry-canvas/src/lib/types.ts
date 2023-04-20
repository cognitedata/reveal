import {
  Annotation,
  ContainerConfig,
  EllipseAnnotation,
  isEllipseAnnotation,
  isRectangleAnnotation,
  RectangleAnnotation,
} from '@cognite/unified-file-viewer';
import { ResourceType } from '@data-exploration-lib/core';

export enum ContainerReferenceType {
  FILE = 'file',
  TIMESERIES = 'timeseries',
  ASSET = 'asset',
  EVENT = 'event',
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

export type FileContainerReference = {
  type: ContainerReferenceType.FILE;
  id: string;
  resourceId: number;
  page: number;
  label?: string;
} & Partial<Dimensions>;

export type AssetContainerReference = {
  type: ContainerReferenceType.ASSET;
  id: string;
  resourceId: number;
  label?: string;
} & Partial<Dimensions>;

export type EventContainerReference = {
  type: ContainerReferenceType.EVENT;
  id: string;
  resourceId: number;
  label?: string;
} & Partial<Dimensions>;

export type ThreeDContainerReference = {
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
  label?: string;
} & Partial<Dimensions>;

export type TimeseriesContainerReference = {
  type: ContainerReferenceType.TIMESERIES;
  id: string;
  resourceId: number;
  startDate: string;
  endDate: string;
  label?: string;
} & Partial<Dimensions>;

export type ContainerReference =
  | FileContainerReference
  | TimeseriesContainerReference
  | AssetContainerReference
  | EventContainerReference
  | ThreeDContainerReference;

export type ShapeAnnotation = RectangleAnnotation | EllipseAnnotation;

export const isShapeAnnotation = (
  annotation: Annotation
): annotation is ShapeAnnotation =>
  isRectangleAnnotation(annotation) || isEllipseAnnotation(annotation);

// Maybe we need to add some metadata etc here in the future
export type CanvasAnnotation = Annotation;

// TODO: This should be better typed per container type
type ResourceMetadata = {
  resourceId?: number;
  resourceType?: ResourceType;
  name?: string;
  externalId?: string;
  assetName?: string; // Used by RevealContainer
  assetExternalId?: string; // Used by RevealContainer
  modelName?: string; // Used by RevealContainer
  modelId?: number; // Used by RevealContainer
};
export type IndustryCanvasContainerConfig = ContainerConfig<ResourceMetadata>;
// NOTE: `CanvasState` is a global interface, hence the `Industry` prefix (https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules_typedoc_node_modules_typescript_lib_lib_dom_d_.canvasstate.html)
export type IndustryCanvasState = {
  container: IndustryCanvasContainerConfig;
  canvasAnnotations: CanvasAnnotation[];
};

export type SerializedIndustryCanvasState = {
  containerReferences: ContainerReference[];
  canvasAnnotations: CanvasAnnotation[];
};

export type CanvasDocument = {
  externalId: string;
  name: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  data: IndustryCanvasState;
};

export type SerializedCanvasDocument = Omit<CanvasDocument, 'data'> & {
  data: SerializedIndustryCanvasState;
};
