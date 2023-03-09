import {
  FileInfo,
  Asset,
  CogniteEvent,
  InternalId,
  Timeseries,
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

export type Filter = {
  dataSetIds: InternalId[];
};

export const SOURCE_TYPES = ['timeseries', 'events', 'files'] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];
export type TargetType = 'assets';

export type API = SourceType | TargetType;
