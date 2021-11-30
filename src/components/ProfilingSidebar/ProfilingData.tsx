import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Colors, Loader } from '@cognite/cogs.js';

import { useActiveTableContext } from 'contexts';
import { ColumnType } from 'hooks/table-data';
import { useColumnType } from 'hooks/column-type';
import {
  useRawProfile,
  Column,
  StringProfile,
  NumberProfile,
  BooleanProfile,
} from 'hooks/sdk-queries';

import Message from 'components/Message/Message';
import { Section } from './Section';

const NO_DATA = '—';

type Props = { selectedColumn: ColumnType | undefined };

export const ProfilingData = ({ selectedColumn }: Props): JSX.Element => {
  const { database, table } = useActiveTableContext();
  const fullProfile = useRawProfile({
    database,
    table,
  });
  const limitProfile = useRawProfile({
    database,
    table,
    limit: 1000,
  });

  const {
    data = { columns: {} as Record<string, Column> },
    isLoading,
    isError,
  } = fullProfile.isFetched ? fullProfile : limitProfile;

  const { getColumnType } = useColumnType();

  const columnType = useMemo(
    () => getColumnType(selectedColumn?.title),
    [getColumnType, selectedColumn]
  );

  const {
    count = 0,
    nullCount = 0,
    ...columnProfilingData
  }: Partial<Column> = selectedColumn?.key
    ? data.columns?.[selectedColumn?.key] ?? {}
    : {};

  return (
    <StyledProfilingData>
      {isLoading && <Loader />}
      {isError && <Message message="Profiling service error" type="error" />}
      {columnType === 'Text' && (
        <ColumnString
          count={count}
          nullCount={nullCount}
          data={columnProfilingData.string ?? null}
        />
      )}
      {columnType === 'Boolean' && (
        <ColumnBoolean
          count={count}
          nullCount={nullCount}
          data={columnProfilingData.boolean ?? null}
        />
      )}
      {columnType === 'Number' && (
        <ColumnNumber
          count={count}
          nullCount={nullCount}
          data={columnProfilingData.number ?? null}
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
  console.log('STRING COLUMN');
  console.log(data);
  return (
    <StyledProfilingDataWrapper>
      <Section.Frequency allCount={count} counts={data.valueCounts} />
      <Section title="Distinct values">{data.distinctCount ?? NO_DATA}</Section>
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
  console.log('BOOLEAN COLUMN');
  console.log(data);
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
  console.log('NUMBER COLUMN');
  console.log(data);
  return (
    <StyledProfilingDataWrapper>
      <Section.Distribution histogram={data.histogram} />
      <Section title="Distinct values">{data.distinctCount ?? NO_DATA}</Section>
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
