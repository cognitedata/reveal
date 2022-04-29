import { useCallback, useMemo } from 'react';
import { Body, Button, Flex, Icon, Overline, Title } from '@cognite/cogs.js';
import { DoubleDatapoint, Timeseries } from '@cognite/sdk';
import useDatapointsQuery from 'hooks/useQuery/useDatapointsQuery';
import moment from 'moment';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';
import Loading from 'components/utils/Loading';
import IconContainer from 'components/icons';
import isNumber from 'lodash/isNumber';

import TimeSeriesPreview from '../TimeSeriesPreview';
import ShareButton from '../ShareButton';

import {
  Actions,
  Container,
  Header,
  MetadataItem,
  MetadataList,
  Preview,
} from './elements';

export type TimeSeriesSidebarProps = {
  timeSeries: Timeseries;
  showPreview?: boolean;
  showHeader?: boolean;
  onExpand?: (e?: React.MouseEvent) => void; // show expand btn & handle onclick
};

const TimeSeriesDownloadButton = ({
  timeSeries,
}: {
  timeSeries: Timeseries;
}) => {
  const { data: datapoints, isLoading } = useDatapointsQuery(
    [{ id: timeSeries.id }],
    {
      limit: 1000,
    }
  );

  const data = useMemo(
    () => ({ ...timeSeries, datapoints: datapoints?.[0]?.datapoints }),
    [timeSeries, datapoints]
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <a
      className="cogs-btn cogs-btn-secondary cogs-btn-tiny cogs-btn-tiny--padding cogs-btn-icon-only"
      href={`data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data)
      )}`}
      download={`${timeSeries.id}.json`}
    >
      <Icon type="Download" />
    </a>
  );
};

const TimeSeriesSidebar = ({
  timeSeries,
  showPreview = true,
  showHeader = true,
  onExpand,
}: TimeSeriesSidebarProps) => {
  const { client } = useCDFExplorerContext();
  const { data: datapoints, isLoading } = useDatapointsQuery(
    [{ id: timeSeries.id }],
    { latestOnly: true }
  );

  const latestDatapoint = useMemo(
    () => datapoints?.[0]?.datapoints[0] as DoubleDatapoint,
    [datapoints]
  );
  const latestDatapointValue = useMemo(
    () =>
      isNumber(latestDatapoint?.value)
        ? latestDatapoint?.value.toPrecision(4)
        : latestDatapoint?.value,
    [latestDatapoint]
  );

  const renderLastReading = useCallback(
    () => (
      <>
        <Overline level={1}>Last reading</Overline>
        <Flex justifyContent="space-between" style={{ width: '100%' }}>
          <span>
            {latestDatapointValue} {timeSeries.unit}
          </span>
          <span>{moment(latestDatapoint?.timestamp).fromNow()}</span>
        </Flex>
      </>
    ),
    [latestDatapoint, latestDatapointValue, timeSeries]
  );

  const handleOpenInCharts = () => {
    const endTime = latestDatapoint.timestamp.valueOf();
    const startTime = moment(endTime).subtract(1, 'month').valueOf();
    const url = `https://charts.cogniteapp.com/${client.project}?timeserieIds=${timeSeries.id}&startTime=${startTime}&endTime=${endTime}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Container>
      {showHeader && (
        <Header>
          <IconContainer type="Timeseries" />
          <Title level={6} className="timeseries-sidebar--title">
            {timeSeries.name}
          </Title>
        </Header>
      )}
      {!isLoading &&
        latestDatapoint &&
        (showPreview ? (
          <Preview>
            {renderLastReading()}
            <TimeSeriesPreview
              timeSeries={timeSeries}
              showYAxis
              onClick={onExpand}
            />
          </Preview>
        ) : (
          renderLastReading()
        ))}
      <Actions>
        <Button
          size="small"
          type="primary"
          icon="MergedChart"
          className="timeseries-sidebar--open-in-charts sidebar-action-btn"
          onClick={handleOpenInCharts}
        >
          Open in Charts
        </Button>

        {onExpand && (
          <Button
            size="small"
            type="secondary"
            className="share sidebar-action-btn"
            onClick={onExpand}
          >
            <Icon type="Expand" />
          </Button>
        )}

        <ShareButton className="sidebar-action-btn" />
        <TimeSeriesDownloadButton timeSeries={timeSeries} />
      </Actions>
      <MetadataList>
        <MetadataItem>
          <Body level={2} strong>
            Description
          </Body>
          <Body level={2}>{timeSeries.description}</Body>
        </MetadataItem>
        {Object.keys(timeSeries.metadata || {}).map((key) => (
          <MetadataItem key={key}>
            <Body level={2} strong>
              {key}
            </Body>
            <Body level={2}>{timeSeries.metadata?.[key]}</Body>
          </MetadataItem>
        ))}
      </MetadataList>
    </Container>
  );
};

export default TimeSeriesSidebar;
