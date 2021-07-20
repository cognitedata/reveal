import React, { useEffect, useState } from 'react';
import { Checkbox, Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import { Asset, Timeseries } from '@cognite/sdk';
import { useChart, useUpdateChart } from 'hooks/firebase';
import { useParams } from 'react-router-dom';
import {
  addTimeseries,
  covertTSToChartTS,
  removeTimeseries,
} from 'utils/charts';
import { calculateDefaultYAxis } from 'utils/axis';
import { useSDK } from '@cognite/sdk-provider';
import { trackUsage } from 'utils/metrics';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { addTSToRecentLocalStorage } from 'utils/recentViewLocalstorage';
import TimeseriesSearchHit from './TimeseriesSearchHit';
import AssetSearchHit from './AssetSearchHit';

type Props = {
  viewType: 'assets' | 'timeseries';
};

const RecentlyViewed = ({ viewType }: Props) => {
  const [rvResults, setRvResults] = useState<number[]>([]);
  const title = viewType === 'assets' ? 'tags / assets' : 'time series';

  const sdk = useSDK();
  const { chartId } = useParams<{ chartId: string }>();
  const { data: chart } = useChart(chartId);
  const { mutate: updateChart } = useUpdateChart();

  const selectedExternalIds:
    | undefined
    | string[] = chart?.timeSeriesCollection
    ?.map((t) => t.tsExternalId || '')
    .filter(Boolean);

  useEffect(() => {
    const rv = localStorage.getItem(`rv-${viewType}`);
    if (rv) {
      setRvResults(JSON.parse(rv) ?? []);
    } else {
      localStorage.setItem(`rv-${viewType}`, JSON.stringify([]));
    }
  }, [viewType, updateChart]); // Does not update when adding

  const orderViewArray = (
    viewArray: (Asset | Timeseries)[],
    order: number[]
  ) => {
    viewArray.sort((a, b) => {
      const A = a.id;
      const B = b.id;

      if (order.indexOf(A) > order.indexOf(B)) {
        return 1;
      }
      return -1;
    });

    return viewArray;
  };

  // useCDFItems does not return data in the order the id array is when send in. Need therefore to order it again.
  const sources = orderViewArray(
    useCdfItems<Asset | Timeseries>(
      viewType,
      (rvResults || []).map((id) => ({ id })) || [],
      {
        enabled: !!rvResults && rvResults.length > 0,
      }
    ).data ?? [],
    rvResults
  );

  const handleTimeSeriesClick = async (timeSeries: Timeseries) => {
    if (chart) {
      const tsToRemove = chart.timeSeriesCollection?.find(
        (t) => t.tsId === timeSeries.id
      );
      if (tsToRemove) {
        updateChart(removeTimeseries(chart, tsToRemove.id));
      } else {
        // Calculate y-axis / range
        const range = await calculateDefaultYAxis({
          chart,
          sdk,
          timeSeriesExternalId: timeSeries.externalId || '',
        });
        console.log('FDSFS');
        addTSToRecentLocalStorage(timeSeries.id);
        const newTs = covertTSToChartTS(timeSeries, chartId, range);

        updateChart(addTimeseries(chart, newTs));
        trackUsage('ChartView.AddTimeSeries', { source: 'search' });
      }
    }
  };

  console.log('Srouce: ', sources);

  return (
    <Container>
      <TitleWrapper>
        <Icon type="History" size={20} />
        <Title level={4}> Recently viewed {title}</Title>
      </TitleWrapper>

      <div>
        {viewType === 'assets' ? (
          (sources || []).map((source) => (
            <li key={source.id}>
              <AssetSearchHit asset={source as Asset} />
            </li>
          ))
        ) : (
          <TimeseriesSearchHit
            timeseries={sources as Timeseries[]}
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
        )}
      </div>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1em;
  margin: 10px 28px 20px 28px;
`;

export default RecentlyViewed;
