import React from 'react';
import {
  SelectableItemsProps,
  TableStateProps,
  TableProps,
  SearchResultLoader,
  SearchResultLoaderProps,
  RelatedResourcesLoader,
  RelatedResourcesLoaderProps,
} from '@cognite/data-exploration';
import {
  FileInfo,
  Asset,
  CogniteEvent,
  Timeseries,
  Sequence,
} from '@cognite/sdk';

type Resource = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

export const ResultTableLoader = <T extends Resource>({
  mode = 'search',
  children,
  ...props
}: {
  mode?: 'search' | 'relatedResources';
  children: (tableProps: TableProps<T>) => React.ReactNode;
} & Partial<SearchResultLoaderProps> &
  Partial<RelatedResourcesLoaderProps> &
  Partial<SelectableItemsProps> &
  TableStateProps) => {
  if (mode === 'search') {
    return (
      <SearchResultLoader {...(props as SearchResultLoaderProps)}>
        {children}
      </SearchResultLoader>
    );
  }

  return (
    <RelatedResourcesLoader {...(props as RelatedResourcesLoaderProps)}>
      {children}
    </RelatedResourcesLoader>
  );
};
