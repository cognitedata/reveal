import {
  DateRange,
  FileFilterProps,
  Metadata,
  NullableProperty,
} from '@cognite/sdk';

import { METADATA_ALL_VALUE } from '../constants';

import { ResourceType } from './resource';

export type FilterResourceType = ResourceType | 'document' | 'common';

export interface InternalChartsFilters {
  isPublic?: boolean;
}

export interface FilterState {
  common: InternalCommonFilters;
  asset: InternalAssetFilters;
  timeSeries: InternalTimeseriesFilters;
  sequence: InternalSequenceFilters;
  file: InternalFilesFilters;
  event: InternalEventsFilters;
  document: InternalDocumentFilter;
  threeD: InternalThreeDFilters;
  charts: InternalChartsFilters;
}

export interface FilterProps {
  query: string;
  filter: FilterState;
  defaultFilter?: Partial<FilterState>;
  onFilterChange: (
    resourceType: FilterResourceType,
    filter: FilterState[keyof FilterState]
  ) => void;
  onResetFilterClick: (resourceType: FilterResourceType) => void;
}

// Base internal types

export type InternalCommonFilters = {
  assetSubtreeIds?: { label?: string; value: number }[];
  assetIds?: { label?: string; value: number }[];
  dataSetIds?: { label?: string; value: number }[];
  createdTime?: DateRange;
  lastUpdatedTime?: DateRange;
  externalIdPrefix?: string;
  internalId?: number;
};

export interface InternalEventsFilters extends InternalCommonFilters {
  startTime?: DateRange;
  endTime?: NullableProperty<DateRange>;
  sources?: { label?: string; value: string }[];
  // string type is for legacy implementation, need to be removed later
  type?: string | string[];
  subtype?: string | string[];
  metadata?: { key: string; value: string }[];
}

export interface OldEventsFilters
  extends Omit<InternalEventsFilters, 'metadata'> {
  metadata?: Metadata;
}

export interface InternalAssetFilters extends InternalCommonFilters {
  labels?: { label?: string; value: string }[];
  metadata?: { key: string; value: string | typeof METADATA_ALL_VALUE }[];
  sources?: { label?: string; value: string }[];
  parentIds?: { label?: string; value: number }[];
}

export interface OldAssetFilters
  extends Omit<InternalAssetFilters, 'metadata'> {
  metadata?: Metadata;
}

export interface InternalDocumentFilter extends InternalCommonFilters {
  author?: string[];
  source?: string[];
  type?: string[];
  mimeType?: string[];
  metadata?: { key: string; value: string }[];
  labels?: { label?: string; value: string }[];
}

export interface InternalTimeseriesFilters extends InternalCommonFilters {
  isStep?: boolean;
  isString?: boolean;
  unit?: string | string[];
  metadata?: { key: string; value: string }[];
}

export interface OldTimeseriesFilters
  extends Omit<InternalTimeseriesFilters, 'metadata'> {
  metadata?: Metadata;
}

export interface InternalSequenceFilters extends InternalCommonFilters {
  metadata?: { key: string; value: string }[];
}

export interface OldSequenceFilters
  extends Omit<InternalSequenceFilters, 'metadata'> {
  metadata?: Metadata;
}

// TODO: Remove the 'file filter props' and convert to internal types
export type InternalFilesFilters = Omit<
  FileFilterProps,
  'assetSubtreeIds' | 'dataSetIds' | 'labels' | 'metadata' | 'assetIds'
> & {
  assetSubtreeIds?: { label?: string; value: number }[];
  assetIds?: { label?: string; value: number }[];
  dataSetIds?: { label?: string; value: number }[];
  labels?: { label?: string; value: string }[];
  metadata?: { key: string; value: string }[];
};

export interface InternalThreeDFilters extends InternalCommonFilters {
  labels?: { label?: string; value: string }[];
  metadata?: { key: string; value: string | typeof METADATA_ALL_VALUE }[];
  sources?: { label?: string; value: string }[];
}

export interface OldFilesFilters
  extends Omit<InternalFilesFilters, 'metadata'> {
  metadata?: Metadata;
}

export const COMMON_FILTER_KEYS: readonly (keyof InternalCommonFilters)[] = [
  'assetIds',
  'assetSubtreeIds',
  'dataSetIds',
  'createdTime',
  'lastUpdatedTime',
  'externalIdPrefix',
  'internalId',
] as const;

export type Filters = {
  asset: InternalAssetFilters;
  timeSeries: InternalTimeseriesFilters;
  sequence: InternalSequenceFilters;
  file: InternalFilesFilters;
  event: InternalEventsFilters;
  document: InternalDocumentFilter;
};

export type InternalFilters =
  | InternalAssetFilters
  | InternalTimeseriesFilters
  | InternalFilesFilters
  | InternalDocumentFilter
  | InternalEventsFilters
  | InternalSequenceFilters;
