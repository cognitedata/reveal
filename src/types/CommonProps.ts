import { ResourceSelectionMode } from 'hooks/useSelection';
import {
  AssetFilterProps,
  TimeseriesFilter,
  FileFilterProps,
  EventFilter,
  SequenceFilter,
} from '@cognite/sdk';
import { ResourceItem } from './Types';
import {
  InternalAssetFilters,
  InternalTimeseriesFilters,
  InternalFilesFilters,
  InternalEventsFilters,
  InternalSequenceFilters,
} from 'domain/index';

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

export type FiltersType =
  | AssetFilterProps
  | TimeseriesFilter
  | FileFilterProps
  | EventFilter
  | Required<SequenceFilter>['filter'];

export type NewFiltersType =
  | InternalAssetFilters
  | InternalTimeseriesFilters
  | InternalFilesFilters
  | InternalEventsFilters
  | InternalSequenceFilters;

export type ResourceFilterProps = {
  assetFilter?: InternalAssetFilters;
  timeseriesFilter?: InternalTimeseriesFilters;
  fileFilter?: InternalFilesFilters;
  eventFilter?: InternalEventsFilters;
  sequenceFilter?: InternalSequenceFilters;
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

export type DateRangeProps = {
  dateRange?: [Date, Date];
  onDateRangeChange?: (newRange: [Date, Date]) => void;
};

export type AllowedTableStateId = number | string;

export type TableStateProps = {
  activeIds?: AllowedTableStateId[];
  selectedIds?: AllowedTableStateId[];
  disabledIds?: AllowedTableStateId[];
};
