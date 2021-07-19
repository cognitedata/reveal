import React, { useMemo } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import styled from 'styled-components';
import { Icon, Checkbox, Button, Colors } from '@cognite/cogs.js';
import DelayedComponent from 'components/DelayedComponent';
import { PnidButton } from 'components/SearchResultTable';
import { useInfiniteList, useAggregate } from '@cognite/sdk-react-query-hooks';
import { Asset, Timeseries } from '@cognite/sdk';
import { useParams } from 'react-router-dom';
import { useChart, useUpdateChart } from 'hooks/firebase';
import {
  addTimeseries,
  covertTSToChartTS,
  removeTimeseries,
} from 'utils/charts';
import { calculateDefaultYAxis } from 'utils/axis';
import { trackUsage } from 'utils/metrics';
import Highlighter from 'react-highlight-words';
import TimeseriesSearchHit from './TimeseriesSearchHit';

type Props = {
  asset: Asset;
  query?: string;
};

export default function AssetSearchHit({ asset, query = '' }: Props) {
  const sdk = useSDK();
  const { chartId } = useParams<{ chartId: string }>();
  const { data: chart } = useChart(chartId);
  const { mutate: updateChart } = useUpdateChart();

  const { data, hasNextPage, fetchNextPage } = useInfiniteList<Timeseries>(
    'timeseries',
    5,
    {
      assetIds: [asset.id],
    }
  );
  const { data: dataAmount } = useAggregate('timeseries', {
    assetIds: [asset.id],
  });
  const ts = useMemo(
    () =>
      data?.pages?.reduce(
        (accl, page) => accl.concat(page.items),
        [] as Timeseries[]
      ),
    [data]
  );

  const selectedExternalIds:
    | undefined
    | string[] = chart?.timeSeriesCollection
    ?.map((t) => t.tsExternalId || '')
    .filter(Boolean);

  const handleTimeSeriesClick = async (timeSeries: Timeseries) => {
    if (chart) {
      const tsToRemove = chart.timeSeriesCollection?.find(
        (t) => t.tsExternalId === timeSeries.externalId
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

        const newTs = covertTSToChartTS(timeSeries, chart.id, range);

        updateChart(addTimeseries(chart, newTs));
        trackUsage('ChartView.AddTimeSeries', { source: 'search' });

        // Add to recentlyViewed assets and timeseries
      }
    }
  };

  return (
    <AssetItem>
      <Row>
        <InfoContainer>
          <ResourceNameWrapper>
            <Icon type="ResourceAssets" size={14} />
            <Highlighter
              highlightStyle={{
                backgroundColor: Colors['yellow-4'].alpha(0.4),
                marginLeft: 5,
              }}
              searchWords={[query]}
              textToHighlight={asset.name}
            />
          </ResourceNameWrapper>

          <Description>
            <Highlighter
              highlightStyle={{
                backgroundColor: Colors['yellow-4'].alpha(0.4),
                marginLeft: 5,
              }}
              searchWords={[query]}
              textToHighlight={asset.description ?? ' '}
            />
          </Description>
        </InfoContainer>
        <Right>
          <AssetCount>{dataAmount?.count} </AssetCount>
          <DelayedComponent delay={100}>
            <PnidButton asset={asset}>P&amp;ID</PnidButton>
          </DelayedComponent>
        </Right>
      </Row>
      <Row>
        <TSList>
          <TimeseriesSearchHit
            timeseries={ts}
            query={query}
            renderCheckbox={(t) => (
              <Checkbox
                onClick={(e) => {
                  e.preventDefault();
                  handleTimeSeriesClick(t);
                }}
                name={`${t.id}`}
                checked={selectedExternalIds?.includes(t.externalId || '')}
              />
            )}
          />
          {hasNextPage && (
            <TSItem>
              <Button type="link" onClick={() => fetchNextPage()}>
                Additional time series (
                {(dataAmount?.count || 0) - (ts?.length || 0)})
              </Button>
            </TSItem>
          )}
        </TSList>
      </Row>
    </AssetItem>
  );
}

const AssetItem = styled.div`
  border: 1px solid var(--cogs-greyscale-grey4);
  border-radius: 5px;
  margin-bottom: 10px;
  padding: 10px 15px 0px 15px;
`;

const AssetCount = styled.span`
  border: 1px solid var(--cogs-greyscale-grey4);
  border-radius: 5px;
  float: right;
  padding: 0 5px;
  margin-right: 8px;
  line-height: 26px;
`;

const TSList = styled.ul`
  width: 100%;
  padding: 0;
  margin: 10px 0 10px 0;
  list-style: none;
`;

const TSItem = styled.li`
  border-radius: 5px;
  padding: 0 5px;
  :nth-child(odd) {
    background-color: var(--cogs-greyscale-grey2);
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  word-break: break-word;
`;

const ResourceNameWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: top;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`;

const Description = styled.span`
  margin-left: 20px;
  font-size: 10px;
  padding-top: 4px;
`;

const Right = styled.div`
  display: flex;
  flex-direction: row;
`;
