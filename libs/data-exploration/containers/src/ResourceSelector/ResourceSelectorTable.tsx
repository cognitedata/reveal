import { Dispatch, SetStateAction } from 'react';

import { RowSelectionState, Updater } from '@tanstack/react-table';
import { mapValues } from 'lodash';
import noop from 'lodash/noop';

import {
  FilterState,
  ResourceItem,
  ResourceSelectionMode,
  ResourceType,
} from '@data-exploration-lib/core';
import { ResourceItems } from '@data-exploration-lib/domain-layer';

import {
  AssetSearchResults,
  DocumentSearchResults,
  EventSearchResults,
  FileSearchResults,
  SequenceSearchResults,
  TimeseriesSearchResults,
} from '../Search';

import { ResourceSelection } from './ResourceSelector';

export const ResourceSelectorTable = ({
  resourceType,
  filter,
  query,
  selectedRows,
  selectionMode,
  setSelectedRows,
  onFilterChange,
  isDocumentsApiEnabled = true,
  shouldShowPreviews = true,
  onClick = noop,
}: {
  resourceType: ResourceType;
  filter: FilterState;
  query?: string;
  selectedRows: ResourceSelection;
  setSelectedRows: Dispatch<SetStateAction<ResourceSelection>>;
  selectionMode?: ResourceSelectionMode;
  onClick?: (item: ResourceItems) => void;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
  shouldShowPreviews?: boolean;
  isDocumentsApiEnabled?: boolean;
}) => {
  const commonProps = {
    shouldShowPreviews,
    enableSelection: selectionMode === 'multiple',
    id: `${resourceType}-resource-selector`,
    query,
    selectedRows: selectedRows[resourceType],
    filter: {
      ...filter.common,
      ...filter[resourceType.toLowerCase() as keyof FilterState],
    },
    onRowSelection: (
      updater: Updater<RowSelectionState>,
      data: ResourceItem[]
    ) => {
      setSelectedRows((prev) => {
        if (typeof updater === 'function') {
          const selectedRowIds = updater(
            mapValues(prev[resourceType], (resourceItem) => {
              return Boolean(resourceItem?.id);
            })
          );

          return {
            ...prev,
            [resourceType]: mapValues(selectedRowIds, (_, key) => {
              return (
                data.find((item) => String(item.id) === key) ||
                prev[resourceType][key]
              );
            }),
          };
        }
        return {
          ...prev,
          [resourceType]: mapValues(updater, (_, key) => {
            return data.find((item) => String(item.id) === key);
          }),
        };
      });
    },
    onClick,
    onFilterChange,
  };

  switch (resourceType) {
    case 'asset':
      return (
        <AssetSearchResults showCount isTreeEnabled={false} {...commonProps} />
      );

    case 'file':
      return !isDocumentsApiEnabled ? (
        <FileSearchResults
          showCount
          {...commonProps}
          filter={{ ...filter.common, ...filter.file }}
        />
      ) : (
        <DocumentSearchResults
          {...commonProps}
          hideUploadButton={true}
          filter={{ ...filter.common, ...filter.document }}
        />
      );
    case 'event':
      return <EventSearchResults showCount {...commonProps} />;
    case 'timeSeries':
      return <TimeseriesSearchResults showCount {...commonProps} />;
    case 'sequence':
      return <SequenceSearchResults showCount {...commonProps} />;
    default:
      return <div>ResourceSelectorTable</div>;
  }
};