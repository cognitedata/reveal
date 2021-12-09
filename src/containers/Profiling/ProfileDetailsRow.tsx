import React from 'react';
import styled from 'styled-components';
import { Flex, Colors } from '@cognite/cogs.js';

import { Section, DATA_MISSING } from 'components/ProfilingSection';
import { BooleanProfile, ColumnProfile } from 'hooks/profiling-service';

type Props = {
  allCount: number;
  profile: ColumnProfile;
};

export default function ProfileDetailsRow({ allCount, profile }: Props) {
  const columnType = profile.type;

  return (
    <tr key="profile-details">
      <td colSpan={9} style={{ padding: 0 }}>
        <ExpandedRow>
          {columnType === 'String' && (
            <ProfilingDataString profile={profile} allCount={allCount} />
          )}
          {columnType === 'Number' && (
            <ProfilingDataNumber profile={profile} allCount={allCount} />
          )}
          {columnType === 'Boolean' && (
            <ProfilingDataBoolean profile={profile} allCount={allCount} />
          )}
        </ExpandedRow>
      </td>
    </tr>
  );
}

const ProfilingDataString = ({ allCount, profile }: Props) => {
  const { distinctCount, counts, count, nullCount, min, max, histogram } =
    profile;
  return (
    <>
      <Section title="Numerical statistics">
        <StyledStatisticsRow direction="row" wrap="wrap">
          <NumberOrMissingSummary
            label="Distinct values"
            value={distinctCount}
            isHalf={false}
          />
          <NumberOrMissingSummary label="Non-empty" value={count} />
          <NumberOrMissingSummary label="Empty" value={nullCount} />
          <NumberOrMissingSummary label="Minimum length" value={min} />
          <NumberOrMissingSummary label="Maximum length" value={max} />
        </StyledStatisticsRow>
      </Section>
      <Section.Frequency counts={counts} allCount={allCount} />
      <Section.Distribution histogram={histogram} max={max} />
    </>
  );
};

const ProfilingDataNumber = ({ allCount, profile }: Props) => {
  const {
    distinctCount,
    counts,
    count,
    nullCount,
    min,
    max,
    mean,
    median,
    std,
    histogram,
  } = profile;
  return (
    <>
      <Section title="Numerical statistics">
        <StyledStatisticsRow direction="row" wrap="wrap">
          <NumberOrMissingSummary
            label="Distinct values"
            value={distinctCount}
            isHalf={false}
          />
          <NumberOrMissingSummary label="Non-empty" value={count} />
          <NumberOrMissingSummary label="Empty" value={nullCount} />
          <NumberOrMissingSummary label="Min" value={min} />
          <NumberOrMissingSummary label="Max" value={max} />
          <NumberOrMissingSummary label="Mean" value={mean} />
          <NumberOrMissingSummary label="Median" value={median} />
          <NumberOrMissingSummary label="Standard deviation" value={std} />
        </StyledStatisticsRow>
      </Section>
      <Section.Frequency counts={counts} allCount={allCount} />
      <Section.Distribution histogram={histogram} max={max} />
    </>
  );
};

const ProfilingDataBoolean = ({ allCount, profile }: Props) => {
  const { counts, count, nullCount, profile: boolProfile } = profile;
  const { trueCount } = boolProfile as BooleanProfile;
  const falseCount = count - trueCount - nullCount;
  return (
    <>
      <Section title="Numerical statistics">
        <StyledStatisticsRow direction="row" wrap="wrap">
          <NumberOrMissingSummary label="True" value={trueCount} />
          <NumberOrMissingSummary label="False" value={falseCount} />
          <NumberOrMissingSummary label="Non-empty" value={count} />
          <NumberOrMissingSummary label="Empty" value={nullCount} />
        </StyledStatisticsRow>
      </Section>
      <Section.Frequency counts={counts} allCount={allCount} />
    </>
  );
};

const NumberOrMissingSummary = ({
  label,
  value,
  isHalf = true,
}: {
  label: string;
  value?: number;
  isHalf?: boolean;
}) => (
  <StyledStatisticsItem isHalf={isHalf}>
    <header>{label}</header>
    {Number.isFinite(value) ? value : DATA_MISSING}
  </StyledStatisticsItem>
);

const ExpandedRow = styled.div`
  border-top: 1px solid ${Colors['border-default'].hex()};
  background-color: ${Colors['greyscale-grey1'].hex()};
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 1rem;
`;

const StyledStatisticsRow = styled(Flex)`
  width: 100%;
`;
const StyledStatisticsItem = styled.div`
  flex: ${({ isHalf }: { isHalf: boolean }) =>
    isHalf ? '1 1 50%' : '1 1 100%'};
  padding: 8px 0px;
  font-weight: 600;
  font-size: 18px;
  line-height: 24px;
  header {
    display: block;
    font-weight: 400;
    font-size: 13px;
    line-height: 18px;
  }
`;
