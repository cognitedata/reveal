import { ValueByDataType } from './containers/Filter';

export interface SearchParams {
  searchQuery?: string;
  filters?: ValueByDataType;
}

export type ResourceItem = {
  id?: number;
  type: ResourceType;
};

export type ResourceType =
  | 'asset'
  | 'timeSeries'
  | 'sequence'
  | 'file'
  | 'event'
  | 'threeD';

export enum ContainerReferenceType {
  FILE = 'file',
  TIMESERIES = 'timeseries',
  ASSET = 'asset',
  EVENT = 'event',
  THREE_D = 'threeD',
  FDM_INSTANCE = 'fdmInstance',
}

export type ContainerReference =
  | AssetCentricContainerReference
  | FdmInstanceContainerReference;

export type Dimensions = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
};

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

export type AssetCentricContainerReference =
  | FileContainerReference
  | TimeseriesContainerReference
  | AssetContainerReference
  | EventContainerReference
  | ThreeDContainerReference;

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
