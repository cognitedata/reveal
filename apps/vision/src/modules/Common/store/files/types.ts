import { Asset, FileInfo } from '@cognite/sdk';

// TODO: use Pick instead of Omit?
export type VisionFile = Omit<
  FileInfo,
  | 'externalId'
  | 'dataSetId'
  | 'securityCategories'
  | 'createdTime'
  | 'uploadedTime'
  | 'lastUpdatedTime'
  | 'sourceCreatedTime'
  | 'sourceModifiedTime'
> & {
  linkedAnnotations: string[];
  createdTime: number;
  uploadedTime?: number;
  lastUpdatedTime: number;
  sourceCreatedTime?: number;
}; // TODO: use Date objects

export type Files = {
  byId: Record<number, VisionFile>;
  allIds: number[];
  selectedIds: number[];
};

export type FileState = {
  dataSetIds?: number[];
  extractExif?: boolean;
  files: Files;
};

// TODO remove this
export type VisionAsset = Omit<
  Asset,
  'createdTime' | 'lastUpdatedTime' | 'sourceCreatedType'
> & { createdTime: number; lastUpdatedTime: number };
