import { useMemo } from 'react';
import { Icon, Button, Checkbox } from '@cognite/cogs.js';
import { Timeseries } from '@cognite/sdk';
import { useCdfItems, useInfiniteSearch } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components/macro';
import { trackUsage } from 'services/metrics';
import { useRecoilState } from 'recoil';
import { useAddRemoveTimeseries } from 'components/Search/hooks';
import chartAtom from 'models/chart/atom';
import RecentViewSources from './RecentViewSources';
import TimeseriesSearchResultItem from './TimeseriesSearchResultItem';

type Props = {
  query: string;
};
export default function SearchTimeseries({ query }: Props) {
  const [chart] = useRecoilState(chartAtom);
  const handleTimeSeriesClick = useAddRemoveTimeseries();

  const {
    data: resourcesBySearch,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteSearch<Timeseries>('timeseries', query, 20, undefined, {
    enabled: !!query,
  });

  const { data: resourcesByExternalId } = useCdfItems<Timeseries>(
    'timeseries',
    [{ externalId: query }]
  );

  const timeseriesExactMatch = useMemo(
    () =>
      resourcesByExternalId?.filter(
        ({ externalId }) => externalId === query
      )[0],
    [resourcesByExternalId, query]
  );

  const timeseries = useMemo(
    () =>
      resourcesBySearch?.pages
        ?.reduce((accl, page) => accl.concat(page), [])
        .filter(
          ({ externalId }) => externalId !== timeseriesExactMatch?.externalId
        ),
    [resourcesBySearch, timeseriesExactMatch]
  );

  if (isError) {
    return <Icon type="CloseLarge" />;
  }

  if (isLoading) {
    return <Icon type="Loader" />;
  }

  if (timeseries?.length === 0) {
    return null;
  }

  const selectedExternalIds: undefined | string[] = chart?.timeSeriesCollection
    ?.map((t) => t.tsExternalId || '')
    .filter(Boolean);

  const searchResultElements = timeseries?.map((ts) => (
    <TimeseriesSearchResultItem
      key={ts.id}
      timeseries={ts}
      query={query}
      renderCheckbox={() => (
        <Checkbox
          onClick={(e) => {
            e.preventDefault();
            handleTimeSeriesClick(ts);
            trackUsage('ChartView.AddTimeSeries', { source: 'search' });
          }}
          name={`${ts.id}`}
          checked={selectedExternalIds?.includes(ts.externalId || '')}
        />
      )}
    />
  ));

  const exactMatchResult = timeseriesExactMatch && (
    <TimeseriesSearchResultItem
      isExact
      key={timeseriesExactMatch.id}
      timeseries={timeseriesExactMatch}
      query={query}
      renderCheckbox={() => (
        <Checkbox
          onClick={(e) => {
            e.preventDefault();
            handleTimeSeriesClick(timeseriesExactMatch);
          }}
          name={`${timeseriesExactMatch.id}`}
          checked={selectedExternalIds?.includes(
            timeseriesExactMatch.externalId || ''
          )}
        />
      )}
    />
  );

  return (
    <TSList>
      {!query && <RecentViewSources viewType="timeseries" />}
      {exactMatchResult}
      {searchResultElements}
      {hasNextPage && (
        <TSItem>
          <Button type="link" onClick={() => fetchNextPage()}>
            Additional time series
          </Button>
        </TSItem>
      )}
    </TSList>
  );
}

const TSList = styled.ul`
  width: 100%;
  padding: 0;
  margin: 0 0 10px 0;
  list-style: none;
`;

const TSItem = styled.li`
  border-radius: 5px;
  padding: 0 5px;
  :nth-child(odd) {
    background-color: var(--cogs-greyscale-grey2);
  }
`;
