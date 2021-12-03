import React from 'react';
import styled from 'styled-components';
import { Flex, Colors } from '@cognite/cogs.js';
import Distribution from './Distribution';
import FrequencyStats from './FrequencyStats';

type Count = {
  value: string;
  count: number;
};
type Props = {
  nullCount?: number;
  distinctCount?: number;
  allCount: number;
  counts?: Count[];
  distribution?: Count[];
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std?: number;
  count?: number;
};
export default function ProfileDetailsRow({
  distinctCount,
  nullCount,
  min,
  max,
  mean,
  median,
  std,
  counts,
  allCount,
  distribution,
  count,
}: Props) {
  return (
    <tr key="profile-details">
      <td colSpan={9} style={{ padding: 0 }}>
        <ExpandedRow>
          <Panel>
            <header>Numerical statistics</header>
            <Grid direction="row" wrap="wrap">
              <NumberOrMissingSummary
                label="Distinct values"
                value={distinctCount}
              />
              <NumberOrMissingSummary label="Non-empty" value={count} />
              <NumberOrMissingSummary label="Empty" value={nullCount} />
              <NumberOrMissingSummary label="Min" value={min} />
              <NumberOrMissingSummary label="Max" value={max} />
              <NumberOrMissingSummary label="Mean" value={mean} />
              <NumberOrMissingSummary label="Median" value={median} />
              <NumberOrMissingSummary label="Standard deviation" value={std} />
            </Grid>
          </Panel>

          <Panel>
            {counts ? (
              <FrequencyStats counts={counts} allCount={allCount} />
            ) : (
              'MISSING'
            )}
          </Panel>
          <Panel>
            <header>Distribution</header>
            {distribution ? (
              <Flex
                direction="column"
                justifyContent="flex-end"
                style={{
                  height: 'calc(100% - 20px)',
                }}
              >
                <div style={{ height: '320px', marginTop: 16 }}>
                  <Distribution
                    distribution={distribution}
                    isBottomAxisDisplayed
                    isGridDisplayed
                    isTooltipDisplayed
                    rangeEnd={max}
                  />
                </div>
              </Flex>
            ) : (
              'MISSING'
            )}
          </Panel>
        </ExpandedRow>
      </td>
    </tr>
  );
}

const NumberOrMissingSummary = ({
  label,
  value,
}: {
  label: string;
  value?: number;
}) => (
  <div className="item">
    <header>{label}</header>
    {Number.isFinite(value) ? value : 'MISSING'}
  </div>
);

const ExpandedRow = styled.div`
  background-color: ${Colors['greyscale-grey1'].hex()};
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 1rem;
`;
const Panel = styled.div`
  background-color: white;
  padding: 10px;

  header {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    display: block;
  }
`;
const Grid = styled(Flex)`
  .item {
    min-width: 120px;
    margin-right: 10px;
    padding: 8px 12px;
    font-weight: 600;
    font-size: 18px;
    line-height: 24px;
    header {
      display: block;
      font-weight: 400;
      font-size: 13px;
      line-height: 18px;
    }
  }
`;
