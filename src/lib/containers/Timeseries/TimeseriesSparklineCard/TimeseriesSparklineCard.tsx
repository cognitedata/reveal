import React from 'react';
import { Card, Button, Dropdown, Menu, notification } from 'antd';
import { Timeseries } from '@cognite/sdk/dist/src';
import { TimeseriesChart } from 'lib/containers/Timeseries';
import styled from 'styled-components';
import { Body, Tooltip, Icon } from '@cognite/cogs.js';
import { LatestDatapoint } from 'lib/components';

export const TimeseriesSparklineCard = ({
  timeseries,
  onItemClicked,
}: {
  timeseries: Timeseries;
  onItemClicked: (id: number) => void;
}) => {
  const copy = async (s: string) => {
    if (s.length > 0) {
      await navigator.clipboard.writeText(`${s}`);
      notification.info({
        key: 'clipboard',
        message: 'Clipboard updated',
        description: `'${s}' is now available in your clipboard.`,
      });
    }
  };

  const menu = (
    <Menu>
      <Menu.Item onClick={() => copy(`${timeseries.id}`)}>Copy ID</Menu.Item>
      <Menu.Item disabled>Add to collection</Menu.Item>
    </Menu>
  );

  return (
    <Card style={{ backgroundColor: 'white' }}>
      <CardHeader>
        <Dropdown overlay={menu}>
          <Button
            type="text"
            icon={<Icon type="MoreOverflowEllipsisHorizontal" />}
          />
        </Dropdown>
      </CardHeader>
      <TimeseriesChart
        height={200}
        timeseriesId={timeseries.id}
        numberOfPoints={100}
        showAxis="none"
        timeOptions={['1Y']}
        showContextGraph={false}
        showPoints={false}
        enableTooltip={false}
        showGridLine="none"
      />
      <Title>
        <Tooltip
          interactive
          disabled={!timeseries.name}
          content={timeseries.name}
        >
          <TimeseriesText
            level={1}
            strong
            style={{ cursor: 'pointer' }}
            onClick={() => onItemClicked(timeseries.id)}
          >
            {timeseries.name}
          </TimeseriesText>
        </Tooltip>
        <TimeseriesText level={2}>{timeseries.unit}</TimeseriesText>
      </Title>
      <LatestDatapoint timeSeries={timeseries} valueOnly />
    </Card>
  );
};

const CardHeader = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const TimeseriesText = styled(Body)`
  width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
