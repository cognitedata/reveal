import { useMemo } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import { Icon, Button, Checkbox } from '@cognite/cogs.js';
import { useParams } from 'react-router-dom';
import { Timeseries } from '@cognite/sdk';
import { useInfiniteSearch } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components/macro';
import {
  addTimeseries,
  covertTSToChartTS,
  removeTimeseries,
  updateSourceAxisForChart,
} from 'utils/charts';
import { calculateDefaultYAxis } from 'utils/axis';
import { trackUsage } from 'utils/metrics';
import { useAddToRecentLocalStorage } from 'utils/recentViewLocalstorage';
import { useRecoilState } from 'recoil';
import { chartState } from 'atoms/chart';
import { AxisUpdate } from 'components/PlotlyChart';
import TimeseriesSearchHit from './TimeseriesSearchHit';
import RecentViewSources from './RecentViewSources';

type Props = {
  query: string;
};
export default function SearchTimeseries({ query }: Props) {
  const sdk = useSDK();
  const { chartId } = useParams<{ chartId: string }>();
  const [chart, setChart] = useRecoilState(chartState);
  const { addTsToRecent, addAssetToRecent } = useAddToRecentLocalStorage();
  const { data, isLoading, isError, fetchNextPage, hasNextPage } =
    useInfiniteSearch<Timeseries>('timeseries', query, 20, undefined, {
      enabled: !!query,
    });
  const timeseries = useMemo(
    () => data?.pages?.reduce((accl, page) => accl.concat(page), []),
    [data]
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

  return (
    <TSList>
      {!query && <RecentViewSources viewType="timeseries" />}
      <TimeseriesSearchHit
        timeseries={timeseries}
        query={query}
        renderCheckbox={(ts) => (
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
