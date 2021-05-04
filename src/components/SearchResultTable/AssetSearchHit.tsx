import React, { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { subDays } from 'date-fns';
import { useSDK } from '@cognite/sdk-provider';
import styled from 'styled-components';
import { Icon, Checkbox, Button } from '@cognite/cogs.js';
import DelayedComponent from 'components/DelayedComponent';
import { PnidButton } from 'components/SearchResultTable';
import { TimeseriesChart } from '@cognite/data-exploration';
import { useInfiniteList } from '@cognite/sdk-react-query-hooks';
import {
  Asset,
  Timeseries,
  DatapointsMultiQuery,
  Aggregate,
  DoubleDatapoint,
} from '@cognite/sdk';
import { useParams } from 'react-router-dom';
import { useChart, useUpdateChart } from 'hooks/firebase';
import {
  addTimeseries,
  covertTSToChartTS,
  removeTimeseries,
} from 'utils/charts';
import { roundToSignificantDigits } from 'utils/cogniteFunctions';
import dayjs from 'dayjs';

type Props = {
  asset: Asset;
};

const OUTLIER_THRESHOLD = 1000;

const filterOutliers = (someArray: number[], threshold = 1.5) => {
  if (someArray.length < 4) {
    return someArray;
  }
  const values = [...someArray].slice().sort((a, b) => a - b);
  let q1;
  let q3;
  if ((values.length / 4) % 1 === 0) {
    // find quartiles
    q1 = (1 / 2) * (values[values.length / 4] + values[values.length / 4 + 1]);
    q3 =
      (1 / 2) *
      (values[values.length * (3 / 4)] + values[values.length * (3 / 4) + 1]);
  } else {
    q1 = values[Math.floor(values.length / 4 + 1)];
    q3 = values[Math.ceil(values.length * (3 / 4) + 1)];
  }

  const iqr = q3 - q1;
  const maxValue = q3 + iqr * threshold;
  const minValue = q1 - iqr * threshold;

  return values.filter((x) => x >= minValue && x <= maxValue);
};

export default function AssetSearchHit({ asset }: Props) {
  const sdk = useSDK();
  const { chartId } = useParams<{ chartId: string }>();
  const { data: chart } = useChart(chartId);
  const { mutate: updateChart } = useUpdateChart();
  const [tsId, setTsId] = useState<number>();

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
        setTsId(newTs.tsId);
      }
    }
  };

  const datapointsMultiQuery: DatapointsMultiQuery[] = [];
  if (chart && tsId) {
    const dateFrom = subDays(new Date(chart.dateTo), 365);
    const dateTo = new Date(chart.dateTo);
    datapointsMultiQuery.push({
      items: [{ id: tsId }],
      start: dateFrom,
      end: dateTo,
      aggregates: ['interpolation'] as Aggregate[],
      granularity: 'hour',
      limit: 8760, // 365 * 24
    });
  }
  const { data: lastYearRaw } = useQuery(
    ['chart-data', 'timeseries', datapointsMultiQuery],
    () =>
      Promise.all(
        datapointsMultiQuery.map((q) =>
          sdk.datapoints.retrieve(q).then((r) => r[0]?.datapoints)
        )
      )
  );

  const yAxisDeltaMinMax = lastYearRaw?.map((_, index) => {
    const lastYearPoints = lastYearRaw?.[index]
      // @ts-ignore
      .map((datapoint) =>
        'interpolation' in datapoint
          ? (datapoint.interpolation as number)
          : (datapoint as DoubleDatapoint).value
      )
      .filter((value: number | undefined) => value !== undefined)
      .sort();
    const filteredSortedMins = filterOutliers(
      lastYearPoints,
      OUTLIER_THRESHOLD
    );
    const filteredSortedMaxs = filterOutliers(
      lastYearPoints,
      OUTLIER_THRESHOLD
    );
    return {
      min: roundToSignificantDigits(filteredSortedMins[0], 3),
      max: roundToSignificantDigits(
        filteredSortedMaxs[filteredSortedMaxs.length - 1],
        3
      ),
    };
  });

  console.log(yAxisDeltaMinMax);

  return (
    <AssetItem>
      <Row>
        <InfoContainer>
          <ResourceNameWrapper>
            <Icon type="ResourceAssets" size={14} />
            <strong style={{ marginLeft: 5 }}>{asset.name}</strong>
          </ResourceNameWrapper>
          <Description>{asset.description}</Description>
        </InfoContainer>
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
                <InfoContainer>
                  <ResourceNameWrapper>
                    <Icon type="ResourceTimeseries" style={{ minWidth: 14 }} />
                    <span style={{ marginLeft: 5 }}>{t.name}</span>
                  </ResourceNameWrapper>
                  <Description>{t.description}</Description>
                </InfoContainer>
                <Right>
                  <DelayedComponent delay={250 + i}>
                    <div style={{ width: 190 }}>
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
                    </div>
                  </DelayedComponent>

                  <Checkbox
                    onClick={(e) => {
                      e.preventDefault();
                      handleTimeSeriesClick(t);
                    }}
                    name={`${t.id}`}
                    value={selectedIds?.includes(t.id)}
                  />
                </Right>
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
  padding: 5px;
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
`;

const Right = styled.div`
  display: flex;
  flex-direction: row;
`;
