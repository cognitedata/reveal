import React from 'react';
import { SelectableItemsProps, TableStateProps } from 'lib/CommonProps';
import { TableProps } from 'lib/components';
import {
  FileInfo,
  Asset,
  CogniteEvent,
  Timeseries,
  Sequence,
} from '@cognite/sdk';
import {
  SearchResultLoader,
  SearchResultLoaderProps,
} from 'lib/containers/SearchResults';
import {
  RelatedResourcesLoader,
  RelatedResourcesLoaderProps,
} from 'lib/containers/Relationships';

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
