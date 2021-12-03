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
import { Section } from './Section';

const NO_DATA = '—';

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

  const { getColumnType } = useColumnType(database, table);

  const columnType = useMemo(
    () => getColumnType(selectedColumn?.dataKey),
    [getColumnType, selectedColumn]
  );

  const {
    count = 0,
    nullCount = 0,
    ...columnProfilingData
  }: Partial<ColumnProfile> = selectedColumn?.key
    ? data.columns?.find((p) => p.label === selectedColumn?.key) ?? {}
    : {};

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
          count={count}
          nullCount={nullCount}
          data={(columnProfilingData.profile as StringProfile) ?? null}
        />
      )}
      {columnType === 'Boolean' && (
        <ColumnBoolean
          count={count}
          nullCount={nullCount}
          data={(columnProfilingData.profile as BooleanProfile) ?? null}
        />
      )}
      {columnType === 'Number' && (
        <ColumnNumber
          count={count}
          nullCount={nullCount}
          data={(columnProfilingData.profile as NumberProfile) ?? null}
        />
      )}
    </StyledProfilingData>
  );
};

type PropsString = {
  count: number;
  nullCount: number;
  data: StringProfile | null;
};
const ColumnString = ({ count, nullCount, data }: PropsString) => {
  if (!data) return <span />;

  return (
    <StyledProfilingDataWrapper>
      <Section.Frequency allCount={count} counts={data.valueCounts} />
      <Section.DistinctValues
        allCount={count}
        distinctCount={data.distinctCount}
      />
      <Section title="Non-empty" isHalf>
        {count}
      </Section>
      <Section title="Empty" isHalf>
        {nullCount}
      </Section>
      <Section title="Char length min" isHalf>
        {data.lengthRange[0] ?? NO_DATA}
      </Section>
      <Section title="Char length max" isHalf>
        {data.lengthRange[1] ?? NO_DATA}
      </Section>
      <Section.Distribution
        histogram={data.lengthHistogram}
        max={data.lengthRange[1]}
        title="Char length distribution"
      />
    </StyledProfilingDataWrapper>
  );
};

type PropsBoolean = {
  count: number;
  nullCount: number;
  data: BooleanProfile | null;
};
const ColumnBoolean = ({ count, nullCount, data }: PropsBoolean) => {
  if (!data) return <span />;

  const { trueCount = 0 } = data;
  const falseCount = count - trueCount - nullCount;
  return (
    <StyledProfilingDataWrapper>
      <Section.Frequency
        allCount={count}
        counts={[
          ['True', 'False'],
          [data.trueCount, falseCount],
        ]}
      />
      <Section title="True" isHalf>
        {Number(trueCount)}
      </Section>
      <Section title="False" isHalf>
        {falseCount}
      </Section>
      <Section title="Non-empty" isHalf>
        {count}
      </Section>
      <Section title="Empty" isHalf>
        {nullCount}
      </Section>
      <Section.Distribution />
    </StyledProfilingDataWrapper>
  );
};

type PropsNumber = {
  count: number;
  nullCount: number;
  data: NumberProfile | null;
};
const ColumnNumber = ({ count, nullCount, data }: PropsNumber) => {
  if (!data) return <span />;

  return (
    <StyledProfilingDataWrapper>
      <Section.Distribution
        histogram={data.histogram}
        max={data.valueRange[1]}
      />
      <Section.DistinctValues
        allCount={count}
        distinctCount={data.distinctCount}
      />
      <Section title="Non-empty" isHalf>
        {count}
      </Section>
      <Section title="Empty" isHalf>
        {nullCount}
      </Section>
      <Section title="Min" isHalf>
        {data.valueRange[0]}
      </Section>
      <Section title="Max" isHalf>
        {data.valueRange[1]}
      </Section>
      <Section title="Mean" isHalf>
        TODO
      </Section>
      <Section title="Median" isHalf>
        TODO
      </Section>
      <Section title="Standard deviation">TODO</Section>
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
