import { ResourceSelectionMode } from 'lib/hooks/useSelection';
import {
  AssetFilterProps,
  TimeseriesFilter,
  FileFilterProps,
  EventFilter,
  SequenceFilter,
} from '@cognite/sdk';
import { ResourceItem } from './types/Types';

export type SmallPreviewProps = {
  actions?: React.ReactNode[];
  extras?: React.ReactNode[];
  children?: React.ReactNode;
  statusText?: string;
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
  initialAssetFilter?: AssetFilterProps;
  initialTimeseriesFilter?: TimeseriesFilter;
  initialFileFilter?: FileFilterProps;
  initialEventFilter?: EventFilter;
  initialSequenceFilter?: Required<SequenceFilter>['filter'];
};

export type ResourceFilterProps = {
  assetFilter?: AssetFilterProps;
  timeseriesFilter?: TimeseriesFilter;
  fileFilter?: FileFilterProps;
  eventFilter?: EventFilter;
  sequenceFilter?: Required<SequenceFilter>['filter'];
};

export type SetResourceFilterProps = {
  setAssetFilter: (newFilter: AssetFilterProps) => void;
  setTimeseriesFilter: (newFilter: TimeseriesFilter) => void;
  setFileFilter: (newFilter: FileFilterProps) => void;
  setEventFilter: (newFilter: EventFilter) => void;
  setSequenceFilter: (newFilter: Required<SequenceFilter>['filter']) => void;
};

export type DateRangeProps = {
  dateRange?: [Date, Date];
  onDateRangeChange?: (newRange: [Date, Date]) => void;
};
