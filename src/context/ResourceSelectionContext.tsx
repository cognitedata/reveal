import React, { useContext, useState, useEffect } from 'react';
import { ResourceItem, ResourceType } from 'types';
import {
  AssetFilterProps,
  TimeseriesFilter,
  FileFilterProps,
  EventFilter,
  SequenceFilter,
} from 'cognite-sdk-v3';

export type ResourceSelectionMode = 'single' | 'multiple' | 'none';
export type ResourceItemState = ResourceItem & {
  state: 'disabled' | 'active' | 'selected';
};
export type OnSelectListener = (items: ResourceItem) => void;

export type ResourceSelectionObserver = {
  mode: ResourceSelectionMode;
  setMode: (newMode: ResourceSelectionMode) => void;
  allowEdit: boolean;
  setAllowEdit: (newMode: boolean) => void;
  resourcesState: ResourceItemState[];
  setResourcesState: React.Dispatch<React.SetStateAction<ResourceItemState[]>>;
  resourceTypes: ResourceType[];
  setResourceTypes: (newTypes: ResourceType[]) => void;
  assetFilter: AssetFilterProps;
  setAssetFilter: React.Dispatch<React.SetStateAction<AssetFilterProps>>;
  timeseriesFilter: TimeseriesFilter;
  setTimeseriesFilter: React.Dispatch<React.SetStateAction<TimeseriesFilter>>;
  fileFilter: FileFilterProps;
  setFileFilter: React.Dispatch<React.SetStateAction<FileFilterProps>>;
  eventFilter: EventFilter;
  setEventFilter: React.Dispatch<React.SetStateAction<EventFilter>>;
  sequenceFilter: SequenceFilter['filter'];
  setSequenceFilter: React.Dispatch<
    React.SetStateAction<SequenceFilter['filter']>
  >;
  onSelect: OnSelectListener;
  setOnSelectListener: React.Dispatch<React.SetStateAction<OnSelectListener>>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
};

export const ResourceSelectionContext = React.createContext(
  {} as ResourceSelectionObserver
);

export const useResourceTypes = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.resourceTypes;
};

export const useResourceMode = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.mode;
};

export const useResourceEditable = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.allowEdit;
};

export const useQuery: () => [
  string,
  React.Dispatch<React.SetStateAction<string>>
] = () => {
  const observer = useContext(ResourceSelectionContext);
  return [observer.query, observer.setQuery];
};

export const useSelectResource = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.onSelect;
};

export const useSetOnSelectResource = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.setOnSelectListener;
};

export const useResourcesState = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.resourcesState;
};

export const useResourceFilters = () => {
  const observer = useContext(ResourceSelectionContext);
  return {
    assetFilter: observer.assetFilter,
    timeseriesFilter: observer.timeseriesFilter,
    eventFilter: observer.eventFilter,
    sequenceFilter: observer.sequenceFilter,
    fileFilter: observer.fileFilter,
  };
};

const defaultOnSelect = () => {};

export type ResourceSelectionProps = {
  allowEdit?: boolean;
  mode?: ResourceSelectionMode;
  resourceTypes?: ResourceType[];
  assetFilter?: AssetFilterProps;
  timeseriesFilter?: TimeseriesFilter;
  fileFilter?: FileFilterProps;
  eventFilter?: EventFilter;
  sequenceFilter?: SequenceFilter['filter'];
  resourcesState?: ResourceItemState[];
  onSelect?: OnSelectListener;
  children?: React.ReactNode;
};

const defaultMode = 'none';

export const ResourceSelectionProvider = ({
  allowEdit: propsAllowEdit,
  mode: initialMode,
  resourceTypes: initialResourceTypes,
  assetFilter: initialAssetFilter,
  timeseriesFilter: initialTimeseriesFilter,
  fileFilter: initialFileFilter,
  eventFilter: initialEventFilter,
  sequenceFilter: initialSequenceFilter,
  resourcesState: initialResourcesState,
  onSelect: initialOnSelect,
  children,
}: ResourceSelectionProps) => {
  const [query, setQuery] = useState<string>('');
  const [allowEdit, setAllowEdit] = useState<boolean>(propsAllowEdit || false);
  const [mode, setMode] = useState<ResourceSelectionMode>(
    initialMode || defaultMode
  );
  const [onSelect, setOnSelectListener] = useState<OnSelectListener>(
    () => initialOnSelect || defaultOnSelect
  );
  const [resourcesState, setResourcesState] = useState<ResourceItemState[]>(
    initialResourcesState || []
  );
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>(
    initialResourceTypes || ['asset', 'file', 'event', 'sequence', 'timeSeries']
  );
  const [assetFilter, setAssetFilter] = useState<AssetFilterProps>(
    initialAssetFilter || {}
  );
  const [timeseriesFilter, setTimeseriesFilter] = useState<TimeseriesFilter>(
    initialTimeseriesFilter || {}
  );
  const [fileFilter, setFileFilter] = useState<FileFilterProps>(
    initialFileFilter || {}
  );
  const [eventFilter, setEventFilter] = useState<EventFilter>(
    initialEventFilter || {}
  );
  const [sequenceFilter, setSequenceFilter] = useState<
    SequenceFilter['filter']
  >(initialSequenceFilter || {});

  useEffect(() => {
    if (initialResourcesState) {
      setResourcesState(initialResourcesState);
    }
  }, [initialResourcesState]);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    if (initialOnSelect) {
      setOnSelectListener(() => initialOnSelect);
    }
  }, [initialOnSelect]);

  return (
    <ResourceSelectionContext.Provider
      value={{
        allowEdit,
        setAllowEdit,
        mode,
        setMode,
        query,
        setQuery,
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
