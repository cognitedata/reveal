import React, { useContext } from 'react';
import { TimeseriesTable } from 'components/Common';
import { TimeseriesSearchFilter, TimeseriesFilter } from 'cognite-sdk-v3';
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
    <TimeseriesTable
      onTimeseriesClicked={ts =>
        openPreview({ item: { id: ts.id, type: 'timeSeries' } })
      }
      filter={timeseriesFilter}
      query={query}
    />
  );
};
