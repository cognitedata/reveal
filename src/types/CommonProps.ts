import { ResourceSelectionMode } from 'hooks/useSelection';
import {
  AssetFilterProps,
  TimeseriesFilter,
  FileFilterProps,
  EventFilter,
  SequenceFilter,
} from '@cognite/sdk';
import { ResourceItem } from './Types';
import { ThreeDAssetMappingItem } from 'hooks/threeDHooks';

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
  initialAssetFilter?: AssetFilterProps;
  initialTimeseriesFilter?: TimeseriesFilter;
  initialFileFilter?: FileFilterProps;
  initialEventFilter?: EventFilter;
  initialSequenceFilter?: Required<SequenceFilter>['filter'];
};

export type FiltersType =
  | AssetFilterProps
  | TimeseriesFilter
  | FileFilterProps
  | EventFilter
  | Required<SequenceFilter>['filter'];

export type ResourceFilterProps = {
  assetFilter?: AssetFilterProps;
  timeseriesFilter?: TimeseriesFilter;
  fileFilter?: FileFilterProps;
  eventFilter?: EventFilter;
  sequenceFilter?: Required<SequenceFilter>['filter'];
};

export type SetResourceFilterProps = {
  setAssetFilter: React.Dispatch<React.SetStateAction<AssetFilterProps>>;
  setTimeseriesFilter: React.Dispatch<React.SetStateAction<TimeseriesFilter>>;
  setFileFilter: React.Dispatch<React.SetStateAction<FileFilterProps>>;
  setEventFilter: React.Dispatch<React.SetStateAction<EventFilter>>;
  setSequenceFilter: React.Dispatch<
    React.SetStateAction<Required<SequenceFilter>['filter']>
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

export type ThreeDModelClickHandler = (
  mapping: ThreeDAssetMappingItem,
  assetId: number,
  e: React.MouseEvent
) => void;
