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
import {
  GridTable,
  SpacedRow,
  RangePicker,
  EnsureNonEmptyResource,
} from 'components';
import { ResultTableLoader } from 'containers/ResultTableLoader';
import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';
import { TIME_SELECT } from 'containers';
import { Body, Checkbox, Flex } from '@cognite/cogs.js';
import { TimeseriesToolbar } from './TimeseriesToolbar';

export const TimeseriesSearchResults = ({
  query = '',
  filter = {},
  onClick,
  initialView = 'list',
  showRelatedResources = false,
  showDatePicker = false,
  relatedResourceType,
  parentResource,
  showCount = false,
  count,
  dateRange,
  onDateRangeChange,
  ...extraProps
}: {
  query?: string;
  showCount?: boolean;
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
  const [hideEmptyData, setHideEmptyData] = useState(false);
  const [currentView, setCurrentView] = useState<string>(initialView);
  const onClickCheckbox = () => {
    setHideEmptyData(prev => !prev);
  };

  return (
    <>
      <TimeseriesToolbar
        showCount={showCount}
        query={query}
        filter={filter}
        currentView={currentView}
        onViewChange={setCurrentView}
        count={count}
      />

      <EnsureNonEmptyResource api="timeSeries">
        <Flex justifyContent="space-between" alignItems="center">
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
          {showDatePicker && (
            <Checkbox
              onChange={onClickCheckbox}
              name="Hidden"
              checked={hideEmptyData}
            >
              Hide empty
            </Checkbox>
          )}
        </Flex>

        <ResultTableLoader<Timeseries>
          mode={showRelatedResources ? 'relatedResources' : 'search'}
          hideEmptyData={hideEmptyData}
          type="timeSeries"
          filter={filter}
          query={query}
          dateRange={dateRange || [new Date(), new Date()]}
          parentResource={parentResource}
          relatedResourceType={relatedResourceType}
          {...(relatedResourceType === 'relationship'
            ? { estimatedRowHeight: 100 }
            : {})}
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
                canFetchMore
              />
            ) : (
              <TimeseriesTable
                {...props}
                onRowClick={file => {
                  onClick(file);
                  return true;
                }}
                dateRange={dateRange || stateDateRange}
                relatedResourceType={relatedResourceType}
                onDateRangeChange={onDateRangeChange || stateSetDateRange}
              />
            )
          }
        </ResultTableLoader>
      </EnsureNonEmptyResource>
    </>
  );
};
