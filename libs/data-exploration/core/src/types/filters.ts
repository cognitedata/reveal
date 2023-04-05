import {
  DateRange,
  FileFilterProps,
  Metadata,
  NullableProperty,
} from '@cognite/sdk';

import { METADATA_ALL_VALUE } from '../constants/filters';
import { ResourceType } from './resource';

export type FilterResourceType = ResourceType | 'document' | 'common';

export interface FilterState {
  common: InternalCommonFilters;
  asset: InternalAssetFilters;
  timeseries: InternalTimeseriesFilters;
  sequence: InternalSequenceFilters;
  file: InternalFilesFilters;
  event: InternalEventsFilters;
  document: InternalDocumentFilter;
}

export interface FilterProps {
  filter: FilterState;
  onFilterChange: (
    resourceType: FilterResourceType,
    filter: FilterState[keyof FilterState]
  ) => void;
  onResetFilterClick: (resourceType: FilterResourceType) => void;
}

// Base internal types

export type InternalCommonFilters = {
  assetSubtreeIds?: { label?: string; value: number }[];
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
}

export interface OldAssetFilters
  extends Omit<InternalAssetFilters, 'metadata'> {
  metadata?: Metadata;
}

export interface InternalDocumentFilter extends InternalCommonFilters {
  author?: string[];
  source?: string[];
  type?: string[];
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
  'assetSubtreeIds' | 'dataSetIds' | 'labels' | 'metadata'
> & {
  assetSubtreeIds?: { label?: string; value: number }[];
  dataSetIds?: { label?: string; value: number }[];
  labels?: { label?: string; value: string }[];
  metadata?: { key: string; value: string }[];
};

export interface OldFilesFilters
  extends Omit<InternalFilesFilters, 'metadata'> {
  metadata?: Metadata;
}
