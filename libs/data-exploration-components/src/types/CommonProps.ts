import {
  AssetFilterProps,
  TimeseriesFilter,
  FileFilterProps,
  EventFilter,
  SequenceFilter,
} from '@cognite/sdk';

import {
  InternalAssetFilters,
  InternalTimeseriesFilters,
  InternalFilesFilters,
  InternalEventsFilters,
  InternalSequenceFilters,
  OldSequenceFilters,
} from '@data-exploration-lib/core';

import { ResourceSelectionMode } from '../hooks';

import { ResourceItem } from './Types';

export type SmallPreviewProps = {
  actions?: React.ReactNode[];
  extras?: React.ReactNode[];
  children?: React.ReactNode;
  statusText?: string;
  hideTitle?: boolean;
};

export type SelectableItemsProps = {
  onSelect: (item: ResourceItem) => void;
  selectionMode: ResourceSelectionMode;
  isSelected: (item: ResourceItem) => boolean;
};

export type SelectableItemProps = {
  onSelect: () => void;
  selectionMode: ResourceSelectionMode;
  isSelected: boolean;
};

export type InitialResourceFilterProps = {
  initialAssetFilter?: InternalAssetFilters;
  initialTimeseriesFilter?: InternalTimeseriesFilters;
  initialFileFilter?: InternalFilesFilters;
  initialEventFilter?: InternalEventsFilters;
  initialSequenceFilter?: InternalSequenceFilters;
};

export type InitialOldResourceFilterProps = {
  initialAssetFilter?: InternalAssetFilters;
  initialTimeseriesFilter?: InternalTimeseriesFilters;
  initialFileFilter?: InternalFilesFilters;
  initialEventFilter?: InternalEventsFilters;
  initialSequenceFilter?: OldSequenceFilters;
};

export type FiltersType =
  | AssetFilterProps
  | TimeseriesFilter
  | FileFilterProps
  | EventFilter
  | Required<SequenceFilter>['filter'];

export type ResourceFilterProps = {
  assetFilter?: InternalAssetFilters;
  timeseriesFilter?: InternalTimeseriesFilters;
  fileFilter?: InternalFilesFilters;
  eventFilter?: InternalEventsFilters;
  sequenceFilter?: InternalSequenceFilters;
};

export type OldResourceFilterProps = {
  assetFilter?: InternalAssetFilters;
  timeseriesFilter?: InternalTimeseriesFilters;
  fileFilter?: InternalFilesFilters;
  eventFilter?: InternalEventsFilters;
  sequenceFilter?: OldSequenceFilters;
};

export type SetResourceFilterProps = {
  setAssetFilter: React.Dispatch<React.SetStateAction<InternalAssetFilters>>;
  setTimeseriesFilter: React.Dispatch<
    React.SetStateAction<InternalTimeseriesFilters>
  >;
  setFileFilter: React.Dispatch<React.SetStateAction<InternalFilesFilters>>;
  setEventFilter: React.Dispatch<React.SetStateAction<InternalEventsFilters>>;
  setSequenceFilter: React.Dispatch<
    React.SetStateAction<InternalSequenceFilters>
  >;
};

export type SetOldResourceFilterProps = {
  setAssetFilter: React.Dispatch<React.SetStateAction<InternalAssetFilters>>;
  setTimeseriesFilter: React.Dispatch<
    React.SetStateAction<InternalTimeseriesFilters>
  >;
  setFileFilter: React.Dispatch<React.SetStateAction<InternalFilesFilters>>;
  setEventFilter: React.Dispatch<React.SetStateAction<InternalEventsFilters>>;
  setSequenceFilter: React.Dispatch<React.SetStateAction<OldSequenceFilters>>;
};

export type AllowedTableStateId = number | string;

export type TableStateProps = {
  activeIds?: AllowedTableStateId[];
  selectedIds?: AllowedTableStateId[];
  disabledIds?: AllowedTableStateId[];
};
