import React, { useContext } from 'react';
import {
  TimeseriesSearchFilter,
  TimeseriesFilter,
  Timeseries,
} from '@cognite/sdk';
import { SearchResultTable } from 'lib/containers/SearchResults';
import { ResourceSelectionContext, useResourcePreview } from 'lib/context';

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
    <SearchResultTable<Timeseries>
      api="timeseries"
      filter={timeseriesFilter}
      query={query}
      onRowClick={ts =>
        openPreview({ item: { id: ts.id, type: 'timeSeries' } })
      }
    />
  );
};
