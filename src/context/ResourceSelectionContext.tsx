import React, { useContext, useState, useEffect } from 'react';
import { ResourceType } from 'modules/sdk-builder/types';
import {
  AssetFilterProps,
  TimeseriesFilter,
  FileFilterProps,
  EventFilter,
  SequenceFilter,
} from '@cognite/sdk';

export type ResourceSelectionMode = 'single' | 'multiple' | 'none';
export type ResourceItem = {
  id: number;
  type: ResourceType;
};
export type ResourceItemState = ResourceItem & {
  state: 'disabled' | 'active' | 'selected';
};
export type OnSelectListener = (items: ResourceItem) => void;

export type ResourceSelectionObserver = {
  mode: ResourceSelectionMode;
  setMode: (newMode: ResourceSelectionMode) => void;
  resourcesState: ResourceItemState[];
  setResourcesState: React.Dispatch<React.SetStateAction<ResourceItemState[]>>;
  resourceTypes: ResourceType[];
  setResourceTypes: (newTypes: ResourceType[]) => void;
  assetFilter: AssetFilterProps;
  setAssetFilter: (newFilter: AssetFilterProps) => void;
  timeseriesFilter: TimeseriesFilter;
  setTimeseriesFilter: (newFilter: TimeseriesFilter) => void;
  fileFilter: FileFilterProps;
  setFileFilter: (newFilter: FileFilterProps) => void;
  eventFilter: EventFilter;
  setEventFilter: (newFilter: EventFilter) => void;
  sequenceFilter: SequenceFilter;
  setSequenceFilter: (newFilter: SequenceFilter) => void;
  onSelect: OnSelectListener;
  setOnSelectListener: React.Dispatch<React.SetStateAction<OnSelectListener>>;
};

const ResourceSelectionContext = React.createContext(
  {} as ResourceSelectionObserver
);

export const useResourceMode = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.mode;
};

export const useSelectResource = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.onSelect;
};

export const useResourcesState = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.resourcesState;
};

export const useResourceFilters = () => {
  const observer = useContext(ResourceSelectionContext);
  return {
    asset: observer.assetFilter,
    timeseries: observer.timeseriesFilter,
    event: observer.eventFilter,
    sequence: observer.sequenceFilter,
    file: observer.fileFilter,
  };
};

const defaultOnSelect = () => {};

export const ResourceSelectionProvider = ({
  mode: initialMode = 'none',
  resourceTypes: initialResourceTypes,
  assetFilter: initialAssetFilter = {},
  timeseriesFilter: initialTimeseriesFilter = {},
  fileFilter: initialFileFilter = {},
  eventFilter: initialEventFilter = {},
  sequenceFilter: initialSequenceFilter = {},
  resourcesState: initialResourcesState,
  onSelect: initialOnSelect = defaultOnSelect,
  children,
}: {
  mode?: ResourceSelectionMode;
  resourceTypes?: ResourceType[];
  assetFilter?: AssetFilterProps;
  timeseriesFilter?: TimeseriesFilter;
  fileFilter?: FileFilterProps;
  eventFilter?: EventFilter;
  sequenceFilter?: SequenceFilter;
  resourcesState?: ResourceItemState[];
  onSelect?: OnSelectListener;
  children: React.ReactNode;
}) => {
  const [mode, setMode] = useState<ResourceSelectionMode>(initialMode);
  const [onSelect, setOnSelectListener] = useState<OnSelectListener>(
    () => initialOnSelect
  );
  const [resourcesState, setResourcesState] = useState<ResourceItemState[]>(
    initialResourcesState || []
  );
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>(
    initialResourceTypes || ['assets', 'files']
  );
  const [assetFilter, setAssetFilter] = useState<AssetFilterProps>(
    initialAssetFilter
  );
  const [timeseriesFilter, setTimeseriesFilter] = useState<TimeseriesFilter>(
    initialTimeseriesFilter
  );
  const [fileFilter, setFileFilter] = useState<FileFilterProps>(
    initialFileFilter
  );
  const [eventFilter, setEventFilter] = useState<EventFilter>(
    initialEventFilter
  );
  const [sequenceFilter, setSequenceFilter] = useState<SequenceFilter>(
    initialSequenceFilter
  );

  useEffect(() => {
    if (initialResourcesState) {
      setResourcesState(initialResourcesState);
    }
  }, [initialResourcesState]);

  useEffect(() => {
    if (initialOnSelect) {
      setOnSelectListener(() => initialOnSelect);
    }
  }, [initialOnSelect]);

  return (
    <ResourceSelectionContext.Provider
      value={{
        mode,
        setMode,
        resourceTypes,
        setResourceTypes,
        assetFilter,
        setAssetFilter,
        timeseriesFilter,
        setTimeseriesFilter,
        fileFilter,
        setFileFilter,
        eventFilter,
        setEventFilter,
        sequenceFilter,
        setSequenceFilter,
        resourcesState,
        setResourcesState,
        onSelect,
        setOnSelectListener,
      }}
    >
      {children}
    </ResourceSelectionContext.Provider>
  );
};
export default ResourceSelectionContext;
