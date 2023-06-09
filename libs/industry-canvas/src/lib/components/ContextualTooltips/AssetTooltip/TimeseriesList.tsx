import React from 'react';

import styled from 'styled-components';

import { Button, Icon, Body, Colors, Tooltip } from '@cognite/cogs.js';

import { useAssetTimeseries } from '../../../hooks/useAssetTimeseries';

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
      <TimeseriesHeadline>
        Time series
        <div className="badge">{timeseries.length}</div>
      </TimeseriesHeadline>
      <TimeseriesContainer>
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
                icon="Add"
                size="medium"
                aria-label="Add timeseries"
                onClick={() => onAddTimeseries(ts.id)}
              />
            </Tooltip>
          </TimeseriesRow>
        ))}
      </TimeseriesContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  padding: 4px 0;
`;

const FOUR_AND_A_HALF_ROWS_HEIGHT = 192;
const TimeseriesContainer = styled.div`
  max-height: ${FOUR_AND_A_HALF_ROWS_HEIGHT}px;
  overflow-y: auto;
  overflow-x: hidden;

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 1px var(--cogs-surface--interactive--pressed);
    border-radius: 8px;
    background-color: var(--cogs-surface--misc-code--medium);
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background-color: var(--cogs-surface--status-undefined--muted--pressed);
  }
  ::-webkit-scrollbar-thumb:hover {
    border-radius: 8px;
    background-color: var(--cogs-surface--misc-backdrop);
  }
`;

const TimeseriesHeadline = styled.div`
  color: ${Colors['text-icon--strong--inverted']};
  font-size: 12px;
  display: flex;
  align-items: center;
  .badge {
    background: ${Colors['surface--action--muted--default--inverted']};
    background: Co;
    padding: 2px 4px;
    text-align: center;
    border-radius: 4px;
    margin-left: 4px;
  }
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
  width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default TimeseriesList;
