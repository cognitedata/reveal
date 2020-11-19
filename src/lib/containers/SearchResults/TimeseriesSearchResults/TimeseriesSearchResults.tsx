import React, { useState } from 'react';
import { TimeseriesFilter, Timeseries } from '@cognite/sdk';
import { SelectableItemsProps } from 'lib/CommonProps';
import { SearchResultLoader } from 'lib';
import {
  TimeseriesTable,
  TimeseriesSparklineCard,
} from 'lib/containers/Timeseries';
import { GridTable } from 'lib/components';
import { TimeseriesToolbar } from './TimeseriesToolbar';

export const TimeseriesSearchResults = ({
  query = '',
  filter = {},
  onClick,
  items,
  initialView = 'list',
  ...selectionProps
}: {
  query?: string;
  initialView?: string;
  filter?: TimeseriesFilter;
  items?: Timeseries[];
  onClick: (item: Timeseries) => void;
} & SelectableItemsProps) => {
  const [currentView, setCurrentView] = useState<string>(initialView);
  return (
    <>
      <TimeseriesToolbar
        query={query}
        filter={filter}
        currentView={currentView}
        onViewChange={setCurrentView}
        count={items ? items.length : undefined}
      />
      <SearchResultLoader<Timeseries>
        type="timeSeries"
        filter={filter}
        query={query}
        {...selectionProps}
      >
        {props =>
          currentView === 'grid' ? (
            <div style={{ flex: 1 }}>
              <GridTable<Timeseries>
                {...props}
                cellHeight={360}
                minCellWidth={500}
                data={items || props.data}
                onEndReached={() => props.onEndReached!({ distanceFromEnd: 0 })}
                onItemClicked={timeseries => onClick(timeseries)}
                {...selectionProps}
                renderCell={cellProps => (
                  <TimeseriesSparklineCard {...cellProps} />
                )}
              />
            </div>
          ) : (
            <div style={{ flex: 1 }}>
              <TimeseriesTable
                {...props}
                data={items || props.data}
                onRowClick={file => {
                  onClick(file);
                  return true;
                }}
              />
            </div>
          )
        }
      </SearchResultLoader>
    </>
  );
};
