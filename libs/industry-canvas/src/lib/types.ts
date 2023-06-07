import {
  Annotation,
  ContainerConfig,
  ContainerType,
  EllipseAnnotation,
  isEllipseAnnotation,
  isRectangleAnnotation,
  Metadata,
  RectangleAnnotation,
  TimeseriesContainerProps,
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
  id?: string;
  type: ContainerReferenceType.FILE;
  resourceId: number;
  page?: number;
  label?: string;
} & Partial<Dimensions>;

export type TimeseriesContainerReference = {
  id?: string;
  type: ContainerReferenceType.TIMESERIES;
  resourceId: number;
  startDate?: string;
  endDate?: string;
  label?: string;
} & Partial<Dimensions>;

export type AssetContainerReference = {
  id?: string;
  type: ContainerReferenceType.ASSET;
  resourceId: number;
  label?: string;
} & Partial<Dimensions>;

export type EventContainerReference = {
  id?: string;
  type: ContainerReferenceType.EVENT;
  resourceId: number;
  label?: string;
} & Partial<Dimensions>;

export type ThreeDContainerReference = {
  id?: string;
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

export type ContainerReference =
  | FileContainerReference
  | TimeseriesContainerReference
  | AssetContainerReference
  | EventContainerReference
  | ThreeDContainerReference;

export const isFileContainerReference = (
  containerReference: ContainerReference
): containerReference is FileContainerReference =>
  containerReference.type === ContainerReferenceType.FILE;

export const isTimeseriesContainerReference = (
  containerReference: ContainerReference
): containerReference is TimeseriesContainerReference =>
  containerReference.type === ContainerReferenceType.TIMESERIES;

export const isAssetContainerReference = (
  containerReference: ContainerReference
): containerReference is AssetContainerReference =>
  containerReference.type === ContainerReferenceType.ASSET;

export const isEventContainerReference = (
  containerReference: ContainerReference
): containerReference is EventContainerReference =>
  containerReference.type === ContainerReferenceType.EVENT;

export const isThreeDContainerReference = (
  containerReference: ContainerReference
): containerReference is ThreeDContainerReference =>
  containerReference.type === ContainerReferenceType.THREE_D;

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

// TODO: We should improve the typing here -- update this together with the TODO above.
export const isIndustryCanvasContainerConfig = (
  container: ContainerConfig
): container is IndustryCanvasContainerConfig => {
  if (container.type === ContainerType.FLEXIBLE_LAYOUT) {
    return 'metadata' in container;
  }

  const metadata = container.metadata;
  if (container.type === ContainerType.REVEAL) {
    return metadata !== undefined && 'modelId' in metadata;
  }

  return metadata !== undefined && 'resourceId' in container.metadata;
};

export type IndustryCanvasTimeSeriesContainerConfig =
  Metadata<ResourceMetadata> & TimeseriesContainerProps<ResourceMetadata>;

export const isIndustryCanvasTimeSeriesContainer = (
  container: IndustryCanvasContainerConfig
): container is IndustryCanvasTimeSeriesContainerConfig =>
  container.type === ContainerType.TIMESERIES;

// NOTE: `CanvasState` is a global interface, hence the `Industry` prefix (https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules_typedoc_node_modules_typescript_lib_lib_dom_d_.canvasstate.html)
export type IndustryCanvasState = {
  container: IndustryCanvasContainerConfig;
  canvasAnnotations: CanvasAnnotation[];
};

export type SerializedIndustryCanvasState = {
  containerReferences: ContainerReference[];
  canvasAnnotations: CanvasAnnotation[];
};

export type UserIdentifier = string;
type ISOString = string;

export type CanvasMetadata = {
  externalId: string;
  name: string;
  isArchived?: boolean;

  createdAt: ISOString;
  createdBy: UserIdentifier;

  updatedAt: ISOString;
  updatedBy: UserIdentifier;
};

export type CanvasDocument = CanvasMetadata & { data: IndustryCanvasState };

export type SerializedCanvasDocument = Omit<CanvasDocument, 'data'> & {
  data: SerializedIndustryCanvasState;
};
