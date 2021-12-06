import React from 'react';
import styled from 'styled-components';
import { Flex, Colors } from '@cognite/cogs.js';

import { Section } from 'components/ProfilingSection';

type Count = {
  value: string;
  count: number;
};
type Props = {
  nullCount?: number;
  distinctCount?: number;
  allCount: number;
  counts?: Count[];
  histogram?: Count[];
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
  counts,
  allCount,
  count,
  histogram,
}: Props) {
  return (
    <StyledExpandedRow key="profile-details">
      <td colSpan={9} style={{ padding: 0 }}>
        <ExpandedRow>
          <Section title="Numerical statistics">
            <Flex direction="column" style={{ width: '100%' }}>
              <StyledStatisticsRow>
                <NumberOrMissingSummary
                  label="Distinct values"
                  value={distinctCount}
                />
              </StyledStatisticsRow>
              <StyledStatisticsRow>
                <NumberOrMissingSummary label="Non-empty" value={count} />
                <NumberOrMissingSummary label="Empty" value={nullCount} />
              </StyledStatisticsRow>
              <StyledStatisticsRow>
                <NumberOrMissingSummary label="Min" value={min} />
                <NumberOrMissingSummary label="Max" value={max} />
              </StyledStatisticsRow>
              <StyledStatisticsRow>
                <NumberOrMissingSummary label="Mean" value={mean} />
                <NumberOrMissingSummary label="Median" value={median} />
              </StyledStatisticsRow>
            </Flex>
          </Section>
          <Section.Frequency counts={counts} allCount={allCount} />
          <Section.Distribution histogram={histogram} />
        </ExpandedRow>
      </td>
    </StyledExpandedRow>
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

const StyledStatisticsRow = styled(Flex)`
  .item {
    flex: 1;
    padding: 8px 0;
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

  .item:not(:last-child) {
    margin-right: 12px;
  }
`;

const StyledExpandedRow = styled.tr`
  border: 1px solid ${Colors['border-default'].hex()};
`;
