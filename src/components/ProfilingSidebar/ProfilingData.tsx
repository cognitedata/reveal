import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

import { ColumnType } from 'hooks/table-data';
import { useColumnType } from 'hooks/column-type';

import { Section } from './Section';

type Props = { selectedColumn: ColumnType | undefined };

export const ProfilingData = ({ selectedColumn }: Props): JSX.Element => {
  const { getColumnType } = useColumnType();

  const columnType = useMemo(
    () => getColumnType(selectedColumn?.title),
    [getColumnType, selectedColumn]
  );

  return (
    <StyledProfilingData>
      {columnType === 'Text' && <ColumnString />}
      {columnType === 'DateTime' && <ColumnDateTime />}
      {columnType === 'Boolean' && <ColumnBoolean />}
      {columnType === 'Number' && <ColumnNumber />}
    </StyledProfilingData>
  );
};

const ColumnString = () => {
  return (
    <StyledProfilingDataWrapper>
      <Section.Frequency />
      <Section title="Distinct values">123</Section>
      <Section title="Non-empty" isHalf>
        12
      </Section>
      <Section title="Empty" isHalf>
        23
      </Section>
      <Section title="Char length min" isHalf>
        1
      </Section>
      <Section title="Char length max" isHalf>
        11
      </Section>
      <Section.Distribution />
    </StyledProfilingDataWrapper>
  );
};

const ColumnDateTime = () => {
  return (
    <StyledProfilingDataWrapper>
      <Section.Distribution />
      <Section title="Distinct values">123</Section>
      <Section title="Non-empty" isHalf>
        12
      </Section>
      <Section title="Empty" isHalf>
        23
      </Section>
      <Section title="First date" isHalf>
        01.04.2013
      </Section>
      <Section title="Last date" isHalf>
        07.04.2013
      </Section>
    </StyledProfilingDataWrapper>
  );
};

const ColumnBoolean = () => {
  return (
    <StyledProfilingDataWrapper>
      <Section.Frequency />
      <Section title="Distinct values">123</Section>
      <Section title="True" isHalf>
        123
      </Section>
      <Section title="False" isHalf>
        321
      </Section>
      <Section title="Non-empty" isHalf>
        12
      </Section>
      <Section title="Empty" isHalf>
        23
      </Section>
      <Section.Distribution />
    </StyledProfilingDataWrapper>
  );
};

const ColumnNumber = () => {
  return (
    <StyledProfilingDataWrapper>
      <Section.Distribution />
      <Section title="Distinct values">123</Section>
      <Section title="Non-empty" isHalf>
        12
      </Section>
      <Section title="Empty" isHalf>
        23
      </Section>
      <Section title="Min" isHalf>
        123
      </Section>
      <Section title="Max" isHalf>
        321
      </Section>
      <Section title="Mean" isHalf>
        167
      </Section>
      <Section title="Median" isHalf>
        189
      </Section>
      <Section title="Standard deviation">2.2</Section>
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
