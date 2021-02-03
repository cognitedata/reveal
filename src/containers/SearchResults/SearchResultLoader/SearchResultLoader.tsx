import React, { useMemo } from 'react';
import {
  FileInfo,
  Asset,
  CogniteEvent,
  Timeseries,
  Sequence,
} from '@cognite/sdk';
import { Icon } from '@cognite/cogs.js';
import { Loader, SpacedRow, TableProps } from 'components';
import {
  SelectableItemsProps,
  TableStateProps,
  DateRangeProps,
} from 'CommonProps';
import { convertResourceType, ResourceType } from 'types';
import { useResourceResults } from './hooks';

type RealResourceType = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

export type SearchResultLoaderProps = {
  type: ResourceType;
  query?: string;
  filter?: any;
};

export const SearchResultLoader = <T extends RealResourceType>({
  type,
  query,
  filter = {},
  isSelected = () => false,
  children,
  selectionMode = 'none',
  onSelect = () => {},
  ...props
}: {
  children: (
    tableProps: TableProps<T> & TableStateProps & DateRangeProps
  ) => React.ReactNode;
} & Partial<SelectableItemsProps> &
  SearchResultLoaderProps &
  TableStateProps &
  DateRangeProps) => {
  const api = convertResourceType(type);
  const {
    canFetchMore,
    isFetchingMore,
    fetchMore,
    isFetched,
    isFetching,
    items,
  } = useResourceResults(api, query, filter);

  const selectedIds = useMemo(
    () =>
      (items || [])
        .filter(el => isSelected({ type, id: el.id }))
        .map(el => el.id),
    [items, isSelected, type]
  );

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <>
      {children({
        ...props,
        query,
        onEndReached: () => {
          if (canFetchMore && !isFetchingMore) {
            fetchMore();
          }
        },
        footerHeight: isFetching ? 20 : 0,
        footerRenderer: (
          <SpacedRow>
            <div className="spacer" />
            <Icon type="Loading" />
            <div className="spacer" />
          </SpacedRow>
        ),
        selectedIds,
        selectionMode,
        onRowSelected: item => onSelect({ type, id: item.id }),
        data: items as T[] | undefined,
      })}
    </>
  );
};
