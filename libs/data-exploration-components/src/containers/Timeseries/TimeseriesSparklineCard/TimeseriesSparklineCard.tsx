import React from 'react';

import styled from 'styled-components';

import { Card, Button, Dropdown, Menu, notification } from 'antd';

import { Body, Tooltip, Icon } from '@cognite/cogs.js';
import { Timeseries } from '@cognite/sdk';

import { DateRangeProps } from '@data-exploration-lib/core';

import { GridCellProps, LatestDatapoint } from '../../../components';
import { TimeseriesChart } from '../TimeseriesChart/TimeseriesChart';

export const TimeseriesSparklineCard = ({
  item,
  onClick,
  style,
  dateRange,
  onDateRangeChange,
}: GridCellProps<Timeseries> & DateRangeProps) => {
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
      <Menu.Item onClick={() => copy(`${item.id}`)}>Copy ID</Menu.Item>
    </Menu>
  );

  return (
    <div style={{ ...style, padding: 12 }}>
      <Card
        style={{
          backgroundColor: 'white',
          height: '100%',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <CardHeader>
          <Dropdown overlay={menu}>
            <Button type="text" icon={<Icon type="EllipsisHorizontal" />} />
          </Dropdown>
        </CardHeader>
        <TimeseriesChart
          height={200}
          timeseriesId={item.id}
          numberOfPoints={500}
          showAxis="both"
          timeOptions={[]}
          showContextGraph={false}
          showPoints={false}
          enableTooltip
          showGridLine="none"
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
        />
        <Title>
          <Tooltip interactive disabled={!item.name} content={item.name}>
            <TimeseriesName level={1} strong onClick={onClick}>
              {item.name}
            </TimeseriesName>
          </Tooltip>
          <TimeseriesText level={2}>{item.unit}</TimeseriesText>
        </Title>
        <LatestDatapoint timeSeries={item} valueOnly />
      </Card>
    </div>
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

const TimeseriesName = styled(TimeseriesText)`
  cursor: pointer;
  color: var(--cogs-text-icon--interactive--default);
  &:hover {
    text-decoration: underline;
  }
`;
