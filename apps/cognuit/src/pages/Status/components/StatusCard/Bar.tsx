import { Detail } from '@cognite/cogs.js';
import { statusConfig } from 'configs/status.config';
import takeRight from 'lodash/takeRight';
import React from 'react';
import styled from 'styled-components';
import { HeartbeatsReportResponse } from 'types/ApiInterface';

const Bar = styled.div<{ online: boolean }>`
  width: 2px;
  height: 32px;
  border-radius: 2px;
  background-color: ${(props) => (props.online ? 'green' : 'red')};
`;

const BarContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const BarContent = styled.div`
  margin-top: 32px;

  & > *:last-child {
    margin-top: 8px;
  }
`;

const Description = styled(Detail)`
  color: rgba(0, 0, 0, 0.45);
`;

export const StatusBar: React.FC<
  Pick<HeartbeatsReportResponse, 'aggregates'>
> = ({ aggregates }) => {
  const sortedAggregates = React.useMemo(() => {
    const sorted = Object.keys(aggregates)
      .map(Number)
      .sort((a, b) => a - b);

    return takeRight(sorted, statusConfig.beatsInADay);
  }, [aggregates]);

  const average = React.useMemo(() => {
    const activeBeats = sortedAggregates.reduce((acc, item) => {
      const onlineBeat = aggregates[item];

      return acc + (onlineBeat ? 1 : 0);
    }, 0);

    const calculateAverage = (activeBeats / statusConfig.beatsInADay) * 100;

    return calculateAverage.toFixed(2);
  }, [sortedAggregates]);

  return (
    <BarContent>
      <BarContainer>
        {sortedAggregates.map((item) => (
          <Bar key={item} online={aggregates[item]} />
        ))}
      </BarContainer>
      <BarContainer>
        <Description>24 hours ago</Description>
        <Detail>{average}% uptime</Detail>
        <Description>now</Description>
      </BarContainer>
    </BarContent>
  );
};
