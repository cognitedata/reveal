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
}) => {
  const commonProps = {
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
          return {
            ...prev,
            [resourceType]: mapValues(
              updater(
                mapValues(prev[resourceType], function (resourceItem) {
                  return Boolean(resourceItem?.id);
                })
              ),
              function (_, key) {
                return data.find((item) => String(item.id) === key);
              }
            ),
          };
        }
        return {
          ...prev,
          [resourceType]: mapValues(updater, function (_, key) {
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
      return (
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
