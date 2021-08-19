import { useEffect } from 'react';
import { Checkbox, Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import { Asset, Timeseries } from '@cognite/sdk';
import { useParams } from 'react-router-dom';
import {
  addTimeseries,
  covertTSToChartTS,
  removeTimeseries,
} from 'utils/charts';
import { calculateDefaultYAxis } from 'utils/axis';
import { useSDK } from '@cognite/sdk-provider';
import { trackUsage } from 'utils/metrics';
import {
  useAddToRecentLocalStorage,
  useRecentViewLocalStorage,
} from 'utils/recentViewLocalstorage';
import { useCdfItems } from 'utils/cogniteFunctions';
import { useQueryClient } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { chartState } from 'atoms/chart';
import TimeseriesSearchHit from './TimeseriesSearchHit';
import AssetSearchHit from './AssetSearchHit';

type Props = {
  viewType: 'assets' | 'timeseries';
};

const RecentViewSources = ({ viewType }: Props) => {
  const title = viewType === 'assets' ? 'tags / assets' : 'time series';
  const sdk = useSDK();
  const { chartId } = useParams<{ chartId: string }>();
  const chart = useRecoilValue(chartState);
  const setChart = useSetRecoilState(chartState);
  // Takes alot of time to load data
  const { data: rvResults } = useRecentViewLocalStorage(viewType, []);
  const { addTsToRecent, addAssetToRecent } = useAddToRecentLocalStorage();

  const cached = useQueryClient();
  const selectedExternalIds: undefined | string[] = chart?.timeSeriesCollection
    ?.map((t) => t.tsExternalId || '')
    .filter(Boolean);

  useEffect(() => {
    cached.invalidateQueries([`rv-${viewType}`]);
  }, [viewType, cached]);

  const { data: sources } = useCdfItems<Asset | Timeseries>(
    viewType,
    (rvResults || []).map((id) => ({ id })) || [],
    false,
    { enabled: !!rvResults && rvResults.length > 0 }
  );

  const handleTimeSeriesClick = async (timeSeries: Timeseries) => {
    if (chart) {
      const tsToRemove = chart.timeSeriesCollection?.find(
        (t) => t.tsId === timeSeries.id
      );
      if (tsToRemove) {
        setChart(removeTimeseries(chart, tsToRemove.id));
      } else {
        // Calculate y-axis / range
        const range = await calculateDefaultYAxis({
          chart,
          sdk,
          timeSeriesExternalId: timeSeries.externalId || '',
        });
        if (timeSeries.assetId) {
          addAssetToRecent(timeSeries.assetId, timeSeries.id);
        } else {
          addTsToRecent(timeSeries.id);
        }

        const newTs = covertTSToChartTS(timeSeries, chartId, range);
        setChart(addTimeseries(chart, newTs));
        trackUsage('ChartView.AddTimeSeries', { source: 'search' });
      }
    }
  };

  if (!rvResults || rvResults.length === 0) {
    return null;
  }

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
  margin: 10px 28px 20px 10px;
`;

export default RecentViewSources;
