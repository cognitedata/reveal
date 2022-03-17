import React, { useMemo } from 'react';
import { Icon } from '@cognite/cogs.js';
import { Loader, SpacedRow, TableProps } from 'components';
import { SelectableItemsProps } from 'CommonProps';
import { ResourceType, ResourceItem } from 'types';
import {
  FileInfo,
  Asset,
  CogniteEvent,
  Timeseries,
  Sequence,
} from '@cognite/sdk';
import {
  RelatedResourceType,
  useRelatedResourceResults,
} from 'hooks/RelatedResourcesHooks';

type Resource = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

export type RelatedResourcesLoaderProps = {
  relatedResourceType: RelatedResourceType;
  type: ResourceType;
  parentResource: ResourceItem;
};

export const RelatedResourcesLoader = <T extends Resource>({
  relatedResourceType,
  type,
  parentResource,
  isSelected = () => false,
  children,
  selectionMode = 'none',
  onSelect = () => {},
  ...props
}: {
  children: (tableProps: TableProps<T>) => React.ReactNode;
} & Partial<SelectableItemsProps> &
  RelatedResourcesLoaderProps) => {
  const {
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isFetched,
    isIdle,
    isFetching,
    items,
  } = useRelatedResourceResults<T>(relatedResourceType, type, parentResource);

  const selectedIds = useMemo(
    () =>
      (items || [])
        .filter(el => isSelected({ type, id: el.id }))
        .map(el => el.id),
    [items, isSelected, type]
  );

  if (!isFetched && !isIdle) {
    return <Loader />;
  }

  return (
    <>
      {children({
        ...props,
        onEndReached: () => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        footerHeight: isFetching ? 20 : 0,
        footerRenderer: (
          <SpacedRow>
            <div className="spacer" />
            <Icon type="Loader" />
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
