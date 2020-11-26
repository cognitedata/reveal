import React, { useState } from 'react';
import { TimeseriesFilter, Timeseries } from '@cognite/sdk';
import { SelectableItemsProps, DateRangeProps } from 'lib/CommonProps';
import { ResourceItem } from 'lib';
import {
  TimeseriesTable,
  TimeseriesSparklineCard,
} from 'lib/containers/Timeseries';
import { GridTable, SpacedRow, RangePicker } from 'lib/components';
import { ResultTableLoader } from 'lib/containers/ResultTableLoader';
import { RelatedResourceType } from 'lib/hooks/RelatedResourcesHooks';
import { TIME_SELECT } from 'lib/containers';
import { Body } from '@cognite/cogs.js';
import { TimeseriesToolbar } from './TimeseriesToolbar';

export const TimeseriesSearchResults = ({
  query = '',
  filter = {},
  onClick,
  initialView = 'list',
  showRelatedResources = false,
  showDatePicker = true,
  relatedResourceType,
  parentResource,
  count,
  dateRange,
  onDateRangeChange,
  ...selectionProps
}: {
  query?: string;
  initialView?: string;
  filter?: TimeseriesFilter;
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  count?: number;
  showDatePicker?: boolean;
  onClick: (item: Timeseries) => void;
} & SelectableItemsProps &
  DateRangeProps) => {
  const [stateDateRange, stateSetDateRange] = useState<[Date, Date]>(
    TIME_SELECT['1Y'].getTime()
  );
  const [currentView, setCurrentView] = useState<string>(initialView);
  return (
    <>
      <TimeseriesToolbar
        query={query}
        filter={filter}
        currentView={currentView}
        onViewChange={setCurrentView}
        count={count}
      />
      {showDatePicker && (
        <SpacedRow style={{ marginBottom: 8 }}>
          <Body level={4} style={{ alignSelf: 'center' }}>
            Showing graph data from
          </Body>
          {onDateRangeChange && (
            <RangePicker
              initialRange={dateRange || stateDateRange}
              onRangeChanged={onDateRangeChange || stateSetDateRange}
            />
          )}
        </SpacedRow>
      )}
      <ResultTableLoader<Timeseries>
        mode={showRelatedResources ? 'relatedResources' : 'search'}
        type="timeSeries"
        filter={filter}
        query={query}
        parentResource={parentResource}
        relatedResourceType={relatedResourceType}
        {...selectionProps}
      >
        {props =>
          currentView === 'grid' ? (
            <GridTable<Timeseries>
              {...props}
              cellHeight={360}
              minCellWidth={500}
              onEndReached={() => props.onEndReached!({ distanceFromEnd: 0 })}
              onItemClicked={timeseries => onClick(timeseries)}
              {...selectionProps}
              renderCell={cellProps => (
                <TimeseriesSparklineCard
                  {...cellProps}
                  dateRange={dateRange || stateDateRange}
                  onDateRangeChange={onDateRangeChange || stateSetDateRange}
                />
              )}
            />
          ) : (
            <TimeseriesTable
              {...props}
              onRowClick={file => {
                onClick(file);
                return true;
              }}
              dateRange={dateRange || stateDateRange}
              onDateRangeChange={onDateRangeChange || stateSetDateRange}
            />
          )
        }
      </ResultTableLoader>
    </>
  );
};
