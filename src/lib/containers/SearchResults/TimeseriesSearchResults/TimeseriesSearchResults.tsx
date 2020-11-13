import React from 'react';
import { TimeseriesFilter, Timeseries } from '@cognite/sdk';
import { SearchResultToolbar } from 'lib/containers/SearchResults';
import { SelectableItemsProps } from 'lib/CommonProps';
import { SearchResultLoader } from 'lib';
import { TimeseriesTable } from 'lib/containers/Timeseries';

export const TimeseriesSearchResults = ({
  query = '',
  filter,
  onClick,
  ...selectionProps
}: {
  query?: string;
  filter: TimeseriesFilter;
  onClick: (item: Timeseries) => void;
} & SelectableItemsProps) => {
  return (
    <>
      <SearchResultToolbar
        api={query.length > 0 ? 'search' : 'list'}
        type="timeseries"
        filter={filter}
        query={query}
      />
      <SearchResultLoader<Timeseries>
        type="timeSeries"
        filter={filter}
        query={query}
        {...selectionProps}
      >
        {props => {
          return <TimeseriesTable {...props} onRowClick={ts => onClick(ts)} />;
        }}
      </SearchResultLoader>
    </>
  );
};
