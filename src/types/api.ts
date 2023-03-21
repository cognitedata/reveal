import {
  FileInfo,
  Asset,
  CogniteEvent,
  InternalId,
  Timeseries,
  Sequence,
} from '@cognite/sdk';

export type RawTimeseries = Omit<
  Timeseries,
  'lastUpdatedTime' | 'createdTime'
> & {
  lastUpdatedTime: number;
  createdTime: number;
};

export type RawCogniteEvent = Omit<
  CogniteEvent,
  'lastUpdatedTime' | 'createdTime'
> & {
  lastUpdatedTime: number;
  createdTime: number;
};

export type RawAsset = Omit<Asset, 'lastUpdatedTime' | 'createdTime'> & {
  lastUpdatedTime: number;
  createdTime: number;
};

export type RawFileInfo = Omit<FileInfo, 'lastUpdatedTime' | 'createdTime'> & {
  lastUpdatedTime: number;
  createdTime: number;
};
export type RawSequence = Omit<Sequence, 'lastUpdatedTime' | 'createdTime'> & {
  lastUpdatedTime: number;
  createdTime: number;
};

export type RawSource =
  | RawTimeseries
  | RawCogniteEvent
  | RawFileInfo
  | RawSequence;

export type RawTarget = RawAsset;

export type Filter = {
  dataSetIds?: InternalId[];
  assetSubtreeIds?: InternalId[];
  root?: boolean;
};

export const SOURCE_TYPES = [
  'timeseries',
  'events',
  'files',
  'sequences',
  'threeD',
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];
export type TargetType = 'assets';
export type API = SourceType | TargetType;

// time series should be referred as time_series instead of timeseries for
// pipeline API
export type PipelineSourceType =
  | Exclude<SourceType, 'timeseries'>
  | 'time_series';
