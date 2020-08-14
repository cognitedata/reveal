import React, { useContext, useState } from 'react';
import { ResourceType } from 'modules/sdk-builder/types';
import {
  AssetFilter,
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
export type DisabledResourceItem = ResourceItem & {
  state: 'disabled' | 'active';
};
export type OnSelectListener = (items: ResourceItem) => void;

export type ResourceSelectionObserver = {
  mode: ResourceSelectionMode;
  setMode: (newMode: ResourceSelectionMode) => void;
  disabledResources: DisabledResourceItem[];
  setDisabledResources: (items: DisabledResourceItem[]) => void;
  resourceTypes: ResourceType[];
  setResourceTypes: (newTypes: ResourceType[]) => void;
  defaultAssetFilter: AssetFilter;
  setDefaultAssetFilter: (newFilter: AssetFilter) => void;
  defaultTimeseriesFilter: TimeseriesFilter;
  setDefaultTimeseriesFilter: (newFilter: TimeseriesFilter) => void;
  defaultFileFilter: FileFilterProps;
  setDefaultFileFilter: (newFilter: FileFilterProps) => void;
  defaultEventFilter: EventFilter;
  setDefaultEventFilter: (newFilter: EventFilter) => void;
  defaultSequenceFilter: SequenceFilter;
  setDefaultSequenceFilter: (newFilter: SequenceFilter) => void;
  onSelect: OnSelectListener;
  setOnSelectListener: (listener: OnSelectListener) => void;
};

const ResourceSelectionContext = React.createContext(
  {} as ResourceSelectionObserver
);

export const useResourceMode = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.mode;
};

export const useDisabledResources = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.disabledResources;
};

export const useSelectResource = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.onSelect;
};

export const useResourceFilters = () => {
  const observer = useContext(ResourceSelectionContext);
  return {
    asset: observer.defaultAssetFilter,
    timeseries: observer.defaultTimeseriesFilter,
    event: observer.defaultEventFilter,
    sequence: observer.defaultSequenceFilter,
    file: observer.defaultFileFilter,
  };
};

export const ResourceSelectionProvider = ({
  mode: initialMode = 'none',
  resourceTypes: initialResourceTypes = ['assets', 'files'],
  assetFilter: initialAssetFilter = {},
  timeseriesFilter: initialTimeseriesFilter = {},
  fileFilter: initialFileFilter = {},
  eventFilter: initialEventFilter = {},
  sequenceFilter: initialSequenceFilter = {},
  disabledResources: initialDisabledResources = [],
  onSelect: initialOnSelect = () => {},
  children,
}: {
  mode?: ResourceSelectionMode;
  resourceTypes?: ResourceType[];
  assetFilter?: AssetFilter;
  timeseriesFilter?: TimeseriesFilter;
  fileFilter?: FileFilterProps;
  eventFilter?: EventFilter;
  sequenceFilter?: SequenceFilter;
  disabledResources?: DisabledResourceItem[];
  onSelect?: OnSelectListener;
  children: React.ReactNode;
}) => {
  const [mode, setMode] = useState<ResourceSelectionMode>(initialMode);
  const [onSelect, setOnSelectListener] = useState<OnSelectListener>(
    () => initialOnSelect
  );
  const [disabledResources, setDisabledResources] = useState<
    DisabledResourceItem[]
  >(initialDisabledResources);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>(
    initialResourceTypes
  );
  const [defaultAssetFilter, setDefaultAssetFilter] = useState<AssetFilter>(
    initialAssetFilter
  );
  const [defaultTimeseriesFilter, setDefaultTimeseriesFilter] = useState<
    TimeseriesFilter
  >(initialTimeseriesFilter);
  const [defaultFileFilter, setDefaultFileFilter] = useState<FileFilterProps>(
    initialFileFilter
  );
  const [defaultEventFilter, setDefaultEventFilter] = useState<EventFilter>(
    initialEventFilter
  );
  const [defaultSequenceFilter, setDefaultSequenceFilter] = useState<
    SequenceFilter
  >(initialSequenceFilter);

  return (
    <ResourceSelectionContext.Provider
      value={{
        mode,
        setMode,
        resourceTypes,
        setResourceTypes,
        defaultAssetFilter,
        setDefaultAssetFilter,
        defaultTimeseriesFilter,
        setDefaultTimeseriesFilter,
        defaultFileFilter,
        setDefaultFileFilter,
        defaultEventFilter,
        setDefaultEventFilter,
        defaultSequenceFilter,
        setDefaultSequenceFilter,
        disabledResources,
        setDisabledResources,
        onSelect,
        setOnSelectListener,
      }}
    >
      {children}
    </ResourceSelectionContext.Provider>
  );
};
export default ResourceSelectionContext;
