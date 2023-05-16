import { FilterState, ResourceType } from '@data-exploration-lib/core';
import { RowSelectionState, Updater } from '@tanstack/react-table';
import noop from 'lodash/noop';

import React, { useState } from 'react';
import {
  AssetSearchResults,
  DocumentSearchResults,
  EventSearchResults,
  SequenceSearchResults,
  TimeseriesSearchResults,
} from '../Search';

export type ResourceSelection = Record<ResourceType, Record<string, boolean>>;

export const ResourceSelectorTable = ({
  resourceType,
  filter,
  query,
}: {
  resourceType: ResourceType;
  filter: FilterState;
  query?: string;
}) => {
  const [selectedRows, setSelectedRow] = useState<ResourceSelection>({
    asset: {},
    file: {},
    timeSeries: {},
    sequence: {},
    threeD: {},
    event: {},
  });
  const commonProps = {
    enableSelection: true,
    id: `${resourceType}-resource-selector`,
    query,
    filter: { ...filter.common, ...filter[resourceType as keyof FilterState] },
    selectedRows: selectedRows[resourceType],
    onRowSelection: (updater: Updater<RowSelectionState>) => {
      setSelectedRow((prev) => {
        if (typeof updater === 'function') {
          return { ...prev, [resourceType]: updater(prev[resourceType]) };
        }
        return { ...prev, [resourceType]: updater };
      });
    },
    onClick: noop,
  };
  const documentProps = { ...commonProps, filter: filter.document };

  switch (resourceType) {
    case 'asset':
      return (
        <AssetSearchResults showCount isTreeEnabled={false} {...commonProps} />
      );

    case 'file':
      return <DocumentSearchResults {...documentProps} />;
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
