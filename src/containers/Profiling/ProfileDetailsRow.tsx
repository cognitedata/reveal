import React from 'react';
import styled from 'styled-components';
import { Flex, Colors } from '@cognite/cogs.js';

import { Section } from 'components/ProfilingSection';
import { ColumnProfile } from 'hooks/profiling-service';

type Props = {
  allCount: number;
  profile: ColumnProfile;
};

export default function ProfileDetailsRow({ allCount, profile }: Props) {
  const columnType = profile.type;
  return (
    <StyledExpandedRow key="profile-details">
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
    </StyledExpandedRow>
  );
}

const ProfilingDataString = ({ allCount, profile }: Props) => {
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
      </Section>
      <Section.Frequency counts={counts} allCount={allCount} />
      <Section.Distribution histogram={histogram} />
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
      </Section>
      <Section.Frequency counts={counts} allCount={allCount} />
      <Section.Distribution histogram={histogram} />
    </>
  );
};

const ProfilingDataBoolean = ({ allCount, profile }: Props) => {
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
      </Section>
      <Section.Frequency counts={counts} allCount={allCount} />
      <Section.Distribution histogram={histogram} />
    </>
  );
};

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

const StyledExpandedRow = styled.tr`
  border: 1px solid ${Colors['border-default'].hex()};
`;
