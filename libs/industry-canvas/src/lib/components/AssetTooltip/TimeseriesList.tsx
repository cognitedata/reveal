import { Button, Icon, Body, Colors, Tooltip } from '@cognite/cogs.js';
import React from 'react';
import { useAssetTimeseries } from '../../hooks/useAssetTimeseries';
import styled from 'styled-components';

type TimeseriesListProps = {
  assetId: number;
  onAddTimeseries: (timeseriesId: number) => void;
};

const TimeseriesList: React.FC<TimeseriesListProps> = ({
  assetId,
  onAddTimeseries,
}) => {
  const { data: timeseries = [], isLoading } = useAssetTimeseries(assetId);

  if (isLoading) {
    return <Icon type="Loader" />;
  }

  if (timeseries.length === 0) {
    return null;
  }

  return (
    <Container>
      {timeseries.map((ts, index) => (
        <TimeseriesRow key={index}>
          <InnerWrapper>
            <ChartChip>
              <Icon type="LineChart" size={16} />
            </ChartChip>
            <Name level={3}>{ts.name}</Name>
          </InnerWrapper>
          <Tooltip content="Add timeseries">
            <Button
              type="ghost"
              inverted
              icon="Plus"
              size="medium"
              aria-label="Add timeseries"
              onClick={() => onAddTimeseries(ts.id)}
            />
          </Tooltip>
        </TimeseriesRow>
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  padding: 4px 0;
`;

const TimeseriesRow = styled.div`
  width: 100%;
  flex: auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 3px 0;
`;

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 0 1 auto;
`;

const ChartChip = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  background: ${Colors['surface--interactive--hover--inverted']};
  color: ${Colors['text-icon--strong--inverted']};
  width: 24px;
  height: 24px;
  flex: none;
`;

const Name = styled(Body)`
  padding-left: 6px;
  color: ${Colors['text-icon--strong--inverted']};
  word-break: break-word;
`;

export default TimeseriesList;
