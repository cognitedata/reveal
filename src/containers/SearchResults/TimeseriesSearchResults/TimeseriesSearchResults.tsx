import React, { useState } from 'react';
import { TimeseriesFilter, Timeseries } from '@cognite/sdk';
import {
  SelectableItemsProps,
  DateRangeProps,
  TableStateProps,
} from 'CommonProps';
import { ResourceItem } from 'types';
import {
  TimeseriesTable,
  TimeseriesSparklineCard,
} from 'containers/Timeseries';
import { GridTable, SpacedRow, RangePicker } from 'components';
import { ResultTableLoader } from 'containers/ResultTableLoader';
import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';
import { TIME_SELECT } from 'containers';
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
  ...extraProps
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
  DateRangeProps &
  TableStateProps) => {
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
        {...extraProps}
      >
        {props =>
          currentView === 'grid' ? (
            <GridTable<Timeseries>
              {...props}
              cellHeight={360}
              minCellWidth={500}
              onEndReached={() => props.onEndReached!({ distanceFromEnd: 0 })}
              onItemClicked={timeseries => onClick(timeseries)}
              {...extraProps}
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
