import React, { useContext } from 'react';
import {
  TimeseriesSearchFilter,
  TimeseriesFilter,
  Timeseries,
} from '@cognite/sdk';
import { SearchResultTable } from 'lib/components/Search/SearchPageTable';
import { ResourceSelectionContext, useResourcePreview } from 'lib/context';
import { SearchResultToolbar } from 'lib/containers/SearchResults';

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

export const TimeseriesSearchResults = ({ query = '' }: { query?: string }) => {
  const { timeseriesFilter } = useContext(ResourceSelectionContext);
  const { openPreview } = useResourcePreview();

  return (
    <>
      <SearchResultToolbar
        api={query.length > 0 ? 'search' : 'list'}
        type="timeseries"
        filter={timeseriesFilter}
        query={query}
      />
      <SearchResultTable<Timeseries>
        api="timeseries"
        filter={timeseriesFilter}
        query={query}
        onRowClick={ts =>
          openPreview({ item: { id: ts.id, type: 'timeSeries' } })
        }
      />
    </>
  );
};
