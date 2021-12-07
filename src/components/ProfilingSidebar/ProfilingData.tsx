import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Colors, Flex, Icon } from '@cognite/cogs.js';

import { useActiveTableContext } from 'contexts';
import { ColumnType } from 'hooks/table-data';
import {
  useColumnType,
  useQuickProfile,
  useFullProfile,
  StringProfile,
  NumberProfile,
  BooleanProfile,
  ColumnProfile,
} from 'hooks/profiling-service';

import Message from 'components/Message/Message';
import { Section, DATA_MISSING } from 'components/ProfilingSection';

type Props = { selectedColumn: ColumnType | undefined };

export const ProfilingData = ({ selectedColumn }: Props): JSX.Element => {
  const { database, table } = useActiveTableContext();
  const fullProfile = useFullProfile({
    database,
    table,
  });
  const limitProfile = useQuickProfile({
    database,
    table,
  });

  const {
    data = { columns: [] },
    isLoading,
    isError,
  } = fullProfile.isFetched ? fullProfile : limitProfile;

  const { getColumnType, isFetched } = useColumnType(database, table);

  const columnType = useMemo(
    () => (isFetched ? getColumnType(selectedColumn?.dataKey) : null),
    [getColumnType, selectedColumn, isFetched]
  );

  const { profile, ...columnProfilingData }: ColumnProfile = selectedColumn?.key
    ? data.columns?.find((p) => p.label === selectedColumn?.key) ??
      ({} as ColumnProfile)
    : ({} as ColumnProfile);

  return (
    <StyledProfilingData>
      {isLoading && (
        <Flex
          alignItems="center"
          justifyContent="center"
          style={{ width: '100%', padding: '20px' }}
        >
          <Icon type="Loader" />
        </Flex>
      )}
      {isError && <Message message="Profiling service error" type="error" />}
      {columnType === 'String' && (
        <ColumnString
          data={columnProfilingData}
          profile={(profile as StringProfile) ?? null}
        />
      )}
      {columnType === 'Boolean' && (
        <ColumnBoolean
          data={columnProfilingData}
          profile={(profile as BooleanProfile) ?? null}
        />
      )}
      {columnType === 'Number' && (
        <ColumnNumber
          data={columnProfilingData}
          profile={(profile as NumberProfile) ?? null}
        />
      )}
    </StyledProfilingData>
  );
};

type BaseColumn = {
  data: Omit<ColumnProfile, 'profile'>;
};

interface PropsString extends BaseColumn {
  profile?: StringProfile | null;
}
const ColumnString = ({ data, profile }: PropsString) => {
  if (!profile) return <span />;
  const { count, counts, nullCount, histogram, min, max } = data;

  return (
    <StyledProfilingDataWrapper>
      <Section.Frequency allCount={count} counts={counts} isCompact />
      <Section.DistinctValues
        allCount={count}
        distinctCount={profile.distinctCount}
        isCompact
      />
      <Section title="Non-empty" isCompact isHalf>
        {count}
      </Section>
      <Section title="Empty" isCompact isHalf>
        {nullCount}
      </Section>
      <Section title="Minimum length" isCompact isHalf>
        {min}
      </Section>
      <Section title="Maximum length" isCompact isHalf>
        {max}
      </Section>
      <Section.Distribution
        histogram={histogram}
        max={max}
        title="Char length distribution"
        isCompact
      />
    </StyledProfilingDataWrapper>
  );
};

interface PropsBoolean extends BaseColumn {
  profile?: BooleanProfile | null;
}
const ColumnBoolean = ({ data, profile }: PropsBoolean) => {
  if (!profile) return <span />;
  const { count, nullCount, counts } = data;
  const { trueCount = 0 } = profile;
  const falseCount = count - trueCount - nullCount;

  return (
    <StyledProfilingDataWrapper>
      <Section.Frequency allCount={count} counts={counts} isCompact />
      <Section title="True" isCompact isHalf>
        {Number(trueCount)}
      </Section>
      <Section title="False" isCompact isHalf>
        {falseCount}
      </Section>
      <Section title="Non-empty" isCompact isHalf>
        {count}
      </Section>
      <Section title="Empty" isCompact isHalf>
        {nullCount}
      </Section>
    </StyledProfilingDataWrapper>
  );
};

interface PropsNumber extends BaseColumn {
  profile?: NumberProfile | null;
}
const ColumnNumber = ({ data, profile }: PropsNumber) => {
  if (!profile) return <span />;
  const { count, nullCount, histogram, min, max, mean, median, std } = data;
  const { distinctCount } = profile;

  return (
    <StyledProfilingDataWrapper>
      <Section.Distribution histogram={histogram} max={max} isCompact />
      <Section.DistinctValues
        allCount={count}
        distinctCount={distinctCount}
        isCompact
      />
      <Section title="Non-empty" isCompact isHalf>
        {count}
      </Section>
      <Section title="Empty" isCompact isHalf>
        {nullCount}
      </Section>
      <Section title="Min" isCompact isHalf>
        {min}
      </Section>
      <Section title="Max" isCompact isHalf>
        {max}
      </Section>
      <Section title="Mean" isCompact isHalf>
        {mean?.toFixed(1) ?? DATA_MISSING}
      </Section>
      <Section title="Median" isCompact isHalf>
        {median?.toFixed(1) ?? DATA_MISSING}
      </Section>
      <Section title="Standard deviation" isCompact>
        {std?.toFixed(1) ?? DATA_MISSING}
      </Section>
    </StyledProfilingDataWrapper>
  );
};

const StyledProfilingData = styled.div`
  display: flex;
  width: 100%;
  border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
  flex-direction: column;
  flex: 1 1 auto;
  overflow: auto;
  border-bottom: none;
`;

const StyledProfilingDataWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
