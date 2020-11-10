import React from 'react';
import {
  TimeseriesSearchFilter,
  TimeseriesFilter,
  Timeseries,
} from '@cognite/sdk';
import { SearchResultTable } from 'lib/components/Search/SearchPageTable';
import { useResourcePreview } from 'lib/context';
import { SearchResultToolbar } from 'lib/containers/SearchResults';
import { SelectableItemsProps } from 'lib/CommonProps';

export const buildTimeseriesFilterQuery = (
  filter: TimeseriesFilter,
  query: string | undefined
): TimeseriesSearchFilter => {
  return {
    ...(query &&
      query.length > 0 && {
        search: {
          name: query,
        },
      }),
    filter,
  };
};

export const TimeseriesSearchResults = ({
  query = '',
  filter,
  ...selectionProps
}: {
  query?: string;
  filter: TimeseriesFilter;
} & SelectableItemsProps) => {
  const { openPreview } = useResourcePreview();

  return (
    <>
      <SearchResultToolbar
        api={query.length > 0 ? 'search' : 'list'}
        type="timeseries"
        filter={filter}
        query={query}
      />
      <SearchResultTable<Timeseries>
        api="timeseries"
        filter={filter}
        query={query}
        onRowClick={ts =>
          openPreview({ item: { id: ts.id, type: 'timeSeries' } })
        }
        {...selectionProps}
      />
    </>
  );
};
