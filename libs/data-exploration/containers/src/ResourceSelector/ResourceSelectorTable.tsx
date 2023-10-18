import { RowSelectionState, Updater } from '@tanstack/react-table';
import noop from 'lodash/noop';

import { ChartsSdkInitialisationGuard } from '@cognite/charts-lib';

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

import { ChartsSearchResults } from './Charts';
import { ResourceSelection } from './ResourceSelector';
import { getResourceSelection } from './utils';

export const ResourceSelectorTable = ({
  resourceType,
  filter,
  defaultFilter = {},
  query,
  selectedRows,
  selectionMode,
  onFilterChange,
  isDocumentsApiEnabled = true,
  shouldShowPreviews = true,
  onClick = noop,
  onSelect = noop,
  isBulkActionBarVisible,
}: {
  resourceType: ResourceType;
  filter: FilterState;
  defaultFilter?: Partial<FilterState>;
  query?: string;
  selectedRows: ResourceSelection;
  selectionMode?: ResourceSelectionMode;
  onClick?: (item: ResourceItems) => void;
  onSelect?: (selection: ResourceSelection) => void;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
  shouldShowPreviews?: boolean;
  isDocumentsApiEnabled?: boolean;
  isBulkActionBarVisible?: boolean;
}) => {
  const filterStateKey = resourceType.toLowerCase() as keyof FilterState;

  const commonProps = {
    shouldShowPreviews,
    enableSelection: selectionMode === 'multiple',
    id: `${resourceType}-resource-selector`,
    query,
    selectedRows: selectedRows[resourceType],
    filter: {
      ...filter.common,
      ...filter[filterStateKey],
    },
    defaultFilter: defaultFilter[filterStateKey],
    onRowSelection: (
      updater: Updater<RowSelectionState>,
      currentData: ResourceItem[]
    ) => {
      const selection = getResourceSelection({
        selectedRows,
        updater,
        currentData,
        resourceType,
      });
      onSelect(selection);
    },
    onClick,
    onFilterChange,
    isBulkActionBarVisible,
  };

  switch (resourceType) {
    case 'charts':
      return (
        <ChartsSdkInitialisationGuard>
          <ChartsSearchResults
            {...commonProps}
            filter={filter.charts}
            onClick={noop}
          />
        </ChartsSdkInitialisationGuard>
      );
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
          defaultFilter={defaultFilter.document}
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
