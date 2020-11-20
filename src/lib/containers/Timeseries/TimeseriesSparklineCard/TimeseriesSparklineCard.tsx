import React from 'react';
import { Card, Button, Dropdown, Menu, notification } from 'antd';
import { Timeseries } from '@cognite/sdk';
import { TimeseriesChart } from 'lib/containers/Timeseries';
import styled from 'styled-components';
import { Body, Tooltip, Icon } from '@cognite/cogs.js';
import { GridCellProps, LatestDatapoint } from 'lib/components';

export const TimeseriesSparklineCard = ({
  item,
  onClick,
  style,
}: GridCellProps<Timeseries>) => {
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
      <Menu.Item disabled>Add to collection</Menu.Item>
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
            <Button
              type="text"
              icon={<Icon type="MoreOverflowEllipsisHorizontal" />}
            />
          </Dropdown>
        </CardHeader>
        <TimeseriesChart
          height={200}
          timeseriesId={item.id}
          numberOfPoints={100}
          showAxis="none"
          timeOptions={['1Y']}
          showContextGraph={false}
          showPoints={false}
          enableTooltip={false}
          showGridLine="none"
        />
        <Title>
          <Tooltip interactive disabled={!item.name} content={item.name}>
            <TimeseriesText
              level={1}
              strong
              style={{ cursor: 'pointer' }}
              onClick={onClick}
            >
              {item.name}
            </TimeseriesText>
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
