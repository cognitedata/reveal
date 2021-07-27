import React from 'react';
import { CogniteAnnotation } from '@cognite/annotations';
import { ProposedCogniteAnnotation } from '@cognite/react-picture-annotation';
import { Body, Checkbox, Icon, Menu, Overline, Title } from '@cognite/cogs.js';
import { useAsset, useAssetTimeseries } from 'hooks/api';
import styled from 'styled-components/macro';
import { TimeseriesChart } from '@cognite/data-exploration';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { useChart, useUpdateChart } from 'hooks/firebase';
import { Timeseries } from '@cognite/sdk';
import {
  addTimeseries,
  removeTimeseries,
  covertTSToChartTS,
} from 'utils/charts';
import { trackUsage } from 'utils/metrics';
import { useAddToRecentLocalStorage } from 'utils/recentViewLocalstorage';

export const AnnotationPopover = ({
  annotations,
}: {
  annotations: (CogniteAnnotation | ProposedCogniteAnnotation)[];
}) => {
  const annotation = annotations[0];
  const selectedAssetId =
    annotation?.resourceType === 'asset' ? annotation.resourceId : undefined;

  const { data: asset, isLoading } = useAsset(selectedAssetId);

  if (annotation?.resourceType !== 'asset' || !selectedAssetId) {
    return <></>;
  }

  if (isLoading) {
    return <Icon type="Loading" />;
  }

  if (!asset) {
    return <>Asset not found!</>;
  }

  return (
    <StyledMenu>
      <TitleContainer>
        <IconBackground>
          <Icon type="ResourceAssets" />
        </IconBackground>
        <AssetInfoContainer>
          <Title level={5}>{asset.name}</Title>
          <Body level={2}>{asset.description}</Body>
        </AssetInfoContainer>
      </TitleContainer>
      <TimeseriesTitle>
        <Overline level={2} style={{ color: 'var(--cogs-greyscale-grey6)' }}>
          Time series:
        </Overline>
      </TimeseriesTitle>
      <TimeseriesList assetId={selectedAssetId} />
    </StyledMenu>
  );
};

export const TimeseriesList = ({ assetId }: { assetId: number }) => {
  const { chartId } = useParams<{ chartId: string }>();
  const { data: chart } = useChart(chartId);
  const { mutate: updateChart } = useUpdateChart();
  const { addTsToRecent, addAssetToRecent } = useAddToRecentLocalStorage();
  const { data: timeseries = [], isLoading } = useAssetTimeseries(assetId);

  const sparklineStartDate = dayjs()
    .subtract(1, 'years')
    .startOf('day')
    .toDate();

  const sparklineEndDate = dayjs().endOf('day').toDate();

  const handleTimeSeriesClick = async (timeSeries: Timeseries) => {
    if (chart) {
      const tsToRemove = chart.timeSeriesCollection?.find(
        (t) => t.tsExternalId === timeSeries.externalId
      );
      if (tsToRemove) {
        updateChart(removeTimeseries(chart, tsToRemove.id));
      } else {
        if (timeSeries.assetId) {
          addAssetToRecent(timeSeries.assetId, timeSeries.id);
        } else {
          addTsToRecent(timeSeries.id);
        }

        const ts = covertTSToChartTS(timeSeries, chartId);
        updateChart(addTimeseries(chart, ts));
        trackUsage('ChartView.AddTimeSeries', { source: 'annotation' });
      }
    }
  };

  if (isLoading) {
    return <Icon type="Loading" style={{ margin: 10 }} />;
  }

  if (timeseries.length === 0) {
    return <span style={{ margin: 10 }}>No timeseries found</span>;
  }

  return (
    <div>
      {timeseries.map((ts) => (
        <TimeseriesItem key={ts.id}>
          <TimeseriesInfo>
            <Title level={6} style={{ width: 290, wordBreak: 'break-all' }}>
              {ts.name}
            </Title>
            <Body level={2}>{ts.description}</Body>
            <TimeseriesChart
              height={55}
              showSmallerTicks
              timeseriesId={ts.id}
              numberOfPoints={100}
              showAxis="horizontal"
              timeOptions={[]}
              showContextGraph={false}
              showPoints={false}
              enableTooltip={false}
              showGridLine="none"
              minRowTicks={2}
              dateRange={[sparklineStartDate, sparklineEndDate]}
            />
          </TimeseriesInfo>
          <Checkbox
            onClick={(e) => {
              e.preventDefault();
              handleTimeSeriesClick(ts);
            }}
            name={`${ts.id}`}
            value={
              !!chart?.timeSeriesCollection?.find(
                (t) => t.tsExternalId === ts.externalId
              )
            }
          />
        </TimeseriesItem>
      ))}
    </div>
  );
};

const StyledMenu = styled(Menu)`
  width: 350px;
  max-height: 400px;
  padding: 0;
  overflow-y: auto;
`;

const TitleContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: top;
  padding: 15px;
`;

const AssetInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const TimeseriesTitle = styled(Menu.Header)`
  border-top: 1px solid var(--cogs-greyscale-grey4);
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
`;

const IconBackground = styled.div`
  padding: 6px;
  background-color: var(--cogs-greyscale-grey2);
  color: var(--cogs-greyscale-grey7);
  border-radius: 4px;
  height: 26px;
  margin-right: 10px;
`;

const TimeseriesItem = styled.div`
  padding: 15px;
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const TimeseriesInfo = styled.div`
  flex-grow: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
