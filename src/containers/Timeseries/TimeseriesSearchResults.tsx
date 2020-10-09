import React, { useContext } from 'react';
import { ResourceTable } from 'components/Common';
import {
  TimeseriesSearchFilter,
  TimeseriesFilter,
  Timeseries,
} from '@cognite/sdk';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { useResourcePreview } from 'context/ResourcePreviewContext';

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
    <ResourceTable<Timeseries>
      api="timeseries"
      filter={timeseriesFilter}
      query={query}
      onRowClick={ts =>
        openPreview({ item: { id: ts.id, type: 'timeSeries' } })
      }
    />
  );
};
