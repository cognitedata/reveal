import { useMemo } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import { Icon, Button, Checkbox } from '@cognite/cogs.js';
import { useParams } from 'react-router-dom';
import { Timeseries } from '@cognite/sdk';
import { useCdfItems, useInfiniteSearch } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components/macro';
import {
  addTimeseries,
  covertTSToChartTS,
  removeTimeseries,
  updateSourceAxisForChart,
} from 'models/chart/updates';
import { calculateDefaultYAxis } from 'utils/axis';
import { trackUsage } from 'services/metrics';
import { useAddToRecentLocalStorage } from 'hooks/recently-used';
import { useRecoilState } from 'recoil';
import { chartAtom } from 'models/chart/atom';
import { AxisUpdate } from 'components/PlotlyChart';
import RecentViewSources from './RecentViewSources';
import TimeseriesSearchResultItem from './TimeseriesSearchResultItem';

type Props = {
  query: string;
};
export default function SearchTimeseries({ query }: Props) {
  const sdk = useSDK();
  const { chartId } = useParams<{ chartId: string }>();
  const [chart, setChart] = useRecoilState(chartAtom);
  const { addTsToRecent, addAssetToRecent } = useAddToRecentLocalStorage();

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
    return <Icon type="XLarge" />;
  }

  if (isLoading) {
    return <Icon type="Loading" />;
  }

  if (timeseries?.length === 0) {
    return null;
  }

  const selectedExternalIds: undefined | string[] = chart?.timeSeriesCollection
    ?.map((t) => t.tsExternalId || '')
    .filter(Boolean);

  const handleTimeSeriesClick = async (timeSeries: Timeseries) => {
    if (!chart) {
      return;
    }

    const tsToRemove = chart.timeSeriesCollection?.find(
      (t) => t.tsId === timeSeries.id
    );

    if (tsToRemove) {
      setChart((oldChart) => removeTimeseries(oldChart!, tsToRemove.id));
    } else {
      const newTs = covertTSToChartTS(timeSeries, chartId, []);
      setChart((oldChart) => addTimeseries(oldChart!, newTs));

      if (timeSeries.assetId) {
        // add both asset and ts if asset exists
        addAssetToRecent(timeSeries.assetId, timeSeries.id);
      } else {
        addTsToRecent(timeSeries.id);
      }

      // Calculate y-axis / range
      const range = await calculateDefaultYAxis({
        chart,
        sdk,
        timeSeriesExternalId: timeSeries.externalId || '',
      });

      const axisUpdate: AxisUpdate = {
        id: newTs.id,
        type: 'timeseries',
        range,
      };

      // Update y axis when ready
      setChart((oldChart) =>
        updateSourceAxisForChart(oldChart!, { x: [], y: [axisUpdate] })
      );

      trackUsage('ChartView.AddTimeSeries', { source: 'search' });
    }
  };

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
