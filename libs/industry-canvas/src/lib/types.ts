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
  ToolType,
} from '@cognite/unified-file-viewer';

import { ResourceType } from '@data-exploration-lib/core';

import { RuleType } from './components/ContextualTooltips/AssetTooltip/types';

export enum ContainerReferenceType {
  FILE = 'file',
  TIMESERIES = 'timeseries',
  ASSET = 'asset',
  EVENT = 'event',
  THREE_D = 'threeD',
  FDM_INSTANCE = 'fdmInstance',
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

export type AssetCentricContainerReference =
  | FileContainerReference
  | TimeseriesContainerReference
  | AssetContainerReference
  | EventContainerReference
  | ThreeDContainerReference;

export type FdmInstanceContainerReference = {
  id?: string;
  type: ContainerReferenceType.FDM_INSTANCE;
  instanceExternalId: string;
  instanceSpace: string;
  viewExternalId: string;
  viewSpace: string;
  viewVersion?: string; // If not specified, the latest version of the view is used
  label?: string;
} & Partial<Dimensions>;

export type ContainerReference =
  | AssetCentricContainerReference
  | FdmInstanceContainerReference;

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

export const isFdmInstanceContainerReference = (
  containerReference: ContainerReference
): containerReference is FdmInstanceContainerReference =>
  containerReference.type === ContainerReferenceType.FDM_INSTANCE;

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
  eventType?: string; // Used by EventContainer
  eventSubType?: string; // Used by EventContainer.
};
export type IndustryCanvasContainerConfig = ContainerConfig<ResourceMetadata>;

// TODO: We should improve the typing here -- update this together with the TODO above.
export const isIndustryCanvasContainerConfig = (
  container: ContainerConfig
): container is IndustryCanvasContainerConfig => {
  const metadata = container.metadata;
  if (container.type === ContainerType.REVEAL) {
    return metadata !== undefined && 'modelId' in metadata;
  }

  if (container.type === ContainerType.FDM_INSTANCE) {
    return metadata !== undefined;
  }

  return metadata !== undefined && 'resourceId' in container.metadata;
};

export type IndustryCanvasTimeSeriesContainerConfig =
  Metadata<ResourceMetadata> & TimeseriesContainerProps<ResourceMetadata>;

export const isIndustryCanvasTimeSeriesContainer = (
  container: IndustryCanvasContainerConfig
): container is IndustryCanvasTimeSeriesContainerConfig =>
  container.type === ContainerType.TIMESERIES;

export type LiveSensorRulesByAnnotationIdByTimeseriesId = Record<
  string,
  Record<number, RuleType[]>
>;

export type FilterConditional = {
  valueAtPath: string;
  isEqualTo: string | undefined;
};

export type SerializedFilterConditional = {
  valueAtPath: string;
  isEqualTo: string | null;
};

export type Filter = {
  appliesToContainerType: ContainerType;
  containerId?: string;
  appliesWhen?: FilterConditional[];
  properties: string[];
};

export type SerializedFilter = Omit<Filter, 'appliesWhen'> & {
  appliesWhen?: SerializedFilterConditional[];
};

// NOTE: `CanvasState` is a global interface, hence the `Industry` prefix (https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules_typedoc_node_modules_typescript_lib_lib_dom_d_.canvasstate.html)
export type IndustryCanvasState = {
  containers: IndustryCanvasContainerConfig[];
  canvasAnnotations: CanvasAnnotation[];
  pinnedTimeseriesIdsByAnnotationId: Record<string, number[]>;
  liveSensorRulesByAnnotationIdByTimeseriesId: LiveSensorRulesByAnnotationIdByTimeseriesId;
  filters: Filter[];
};

export type PinnedSensorValueContext = {
  type: 'PINNED_SENSOR_VALUE';
  payload: {
    targetId: string;
    resourceId: string;
    rules: LiveSensorRulesByAnnotationIdByTimeseriesId;
    version: 1;
  }[];
};

export type FiltersContext = {
  type: 'FILTERS';
  payload: {
    filters: SerializedFilter[];
  };
};

export type CanvasContext = (FiltersContext | PinnedSensorValueContext)[];

export type SerializedIndustryCanvasState = {
  containerReferences: AssetCentricContainerReference[];
  fdmInstanceContainerReferences: FdmInstanceContainerReference[];
  canvasAnnotations: CanvasAnnotation[];
  context: CanvasContext;
};

export type UserIdentifier = string;
type ISOString = string;

export type CanvasMetadata = {
  externalId: string;
  name: string;
  isArchived?: boolean;
  visibility?: string;

  readonly createdTime: ISOString;
  createdBy: UserIdentifier;

  updatedAt: ISOString;
  updatedBy: UserIdentifier;
};

export type CanvasDocument = CanvasMetadata & {
  data: IndustryCanvasState;
};

export type SerializedCanvasDocument = Omit<CanvasDocument, 'data'> & {
  data: SerializedIndustryCanvasState;
};

export enum IndustryCanvasToolType {
  ELLIPSE = ToolType.ELLIPSE,
  STICKY = ToolType.STICKY,
  LINE = ToolType.LINE,
  PAN = ToolType.PAN,
  RECTANGLE = ToolType.RECTANGLE,
  SELECT = ToolType.SELECT,
  TEXT = ToolType.TEXT,
  COMMENT = 'comment',
}

export const COMMENT_METADATA_ID = '_IS_COMMENT';

export type CommentAnnotation = RectangleAnnotation;

export const isCommentAnnotation = (
  annotation: Annotation
): annotation is CommentAnnotation =>
  annotation.metadata && annotation.metadata[COMMENT_METADATA_ID] === true;

// New user type introduced by Auth2.0 team
export type OrganizationUserProfile = {
  id: string;
  email: string;
  name: string;
  pictureUrl: string;
};
