import React, { useEffect, useContext } from 'react';
import { TimeseriesTable } from 'components/Common';
import { TimeseriesSearchFilter, TimeseriesFilter } from 'cognite-sdk-v3';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import {
  searchSelector,
  search,
} from '@cognite/cdf-resources-store/dist/timeseries';
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
  const dispatch = useResourcesDispatch();
  const { timeseriesFilter } = useContext(ResourceSelectionContext);
  const { openPreview } = useResourcePreview();

  const { items: timeseries } = useResourcesSelector(searchSelector)(
    buildTimeseriesFilterQuery(timeseriesFilter, query)
  );

  useEffect(() => {
    dispatch(search(buildTimeseriesFilterQuery(timeseriesFilter, query)));
  }, [dispatch, timeseriesFilter, query]);

  return (
    <TimeseriesTable
      timeseries={timeseries}
      onTimeseriesClicked={ts =>
        openPreview({ item: { id: ts.id, type: 'timeSeries' } })
      }
      query={query}
    />
  );
};
