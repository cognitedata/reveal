import React, { useMemo } from 'react';
import { Icon } from '@cognite/cogs.js';
import { Loader, SpacedRow, TableProps } from 'lib/components';
import { SelectableItemsProps } from 'lib/CommonProps';
import { ResourceType, ResourceItem } from 'lib/types';
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
} from 'lib/hooks/RelatedResourcesHooks';

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
}: {
  children: (tableProps: TableProps<T>) => React.ReactNode;
} & Partial<SelectableItemsProps> &
  RelatedResourcesLoaderProps) => {
  const {
    canFetchMore,
    isFetchingMore,
    fetchMore,
    isFetched,
    isFetching,
    items,
  } = useRelatedResourceResults<T>(relatedResourceType, type, parentResource);

  const selectedIds = useMemo(() => {
    return (items || [])
      .filter(el => {
        return isSelected({ type, id: el.id });
      })
      .map(el => el.id);
  }, [items, isSelected, type]);

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <>
      {children({
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
