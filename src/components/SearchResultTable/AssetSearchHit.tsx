import React, { useMemo } from 'react';

import styled from 'styled-components';
import { Icon, Checkbox, Button } from '@cognite/cogs.js';
import DelayedComponent from 'components/DelayedComponent';
import { PnidButton } from 'components/SearchResultTable';
import { TimeseriesChart } from '@cognite/data-exploration';
import { useInfiniteList } from '@cognite/sdk-react-query-hooks';
import { Asset, Timeseries } from '@cognite/sdk';
import { useParams } from 'react-router-dom';
import { useChart, useUpdateChart } from 'hooks/firebase';
import {
  addTimeseries,
  covertTSToChartTS,
  removeTimeseries,
} from 'utils/charts';
import dayjs from 'dayjs';

type Props = {
  asset: Asset;
};
export default function AssetSearchHit({ asset }: Props) {
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

  const ts = useMemo(
    () =>
      data?.pages?.reduce(
        (accl, page) => accl.concat(page.items),
        [] as Timeseries[]
      ),
    [data]
  );

  const selectedIds: undefined | number[] = chart?.timeSeriesCollection?.map(
    (t) => t.tsId
  );

  const sparklineStartDate = dayjs()
    .subtract(1, 'years')
    .startOf('day')
    .toDate();

  const sparklineEndDate = dayjs().endOf('day').toDate();

  const handleTimeSeriesClick = async (timeSeries: Timeseries) => {
    if (chart) {
      const tsToRemove = chart.timeSeriesCollection?.find(
        (t) => t.tsId === timeSeries.id
      );
      if (tsToRemove) {
        updateChart(removeTimeseries(chart, tsToRemove.id));
      } else {
        const newTs = covertTSToChartTS(
          timeSeries,
          chart.timeSeriesCollection?.length || 0
        );
        updateChart(addTimeseries(chart, newTs));
      }
    }
  };

  return (
    <AssetItem>
      <Row>
        <div style={{ padding: 5 }}>
          <Icon type="ResourceAssets" />
        </div>
        <strong style={{ marginLeft: 10 }}>{asset.name}</strong>
        <span style={{ marginLeft: 10, flexGrow: 2 }}>{asset.description}</span>
        <DelayedComponent delay={100}>
          <PnidButton asset={asset} />
        </DelayedComponent>
        <AssetCount>{ts?.length || 0} </AssetCount>
      </Row>
      <Row>
        <TSList>
          {ts?.map((t, i) => (
            <TSItem key={t.id}>
              <Row>
                <div style={{ padding: 5 }}>
                  <Icon type="ResourceTimeseries" />
                </div>
                <span>{t.name}</span>
                <span>{t.description}</span>
                <DelayedComponent delay={250 + i}>
                  <TimeseriesChart
                    height={65}
                    showSmallerTicks
                    timeseriesId={t.id}
                    numberOfPoints={25}
                    showAxis="horizontal"
                    timeOptions={[]}
                    showContextGraph={false}
                    showPoints={false}
                    enableTooltip={false}
                    showGridLine="none"
                    minRowTicks={2}
                    dateRange={[sparklineStartDate, sparklineEndDate]}
                  />
                </DelayedComponent>

                <Checkbox
                  onClick={(e) => {
                    e.preventDefault();
                    handleTimeSeriesClick(t);
                  }}
                  name={`${t.id}`}
                  value={selectedIds?.includes(t.id)}
                />
              </Row>
            </TSItem>
          ))}
          {hasNextPage && (
            <TSItem>
              <Button type="link" onClick={() => fetchNextPage()}>
                Load more
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
  padding: 5px;
`;

const TSList = styled.ul`
  width: 100%;
  padding: 0;
  margin: 10px 0 10px 0;
  list-style: none;
`;

const TSItem = styled.li`
  border-radius: 5px;
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
