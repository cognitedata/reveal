import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Colors, Flex } from '@cognite/cogs.js';

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
      {columnType === 'Text' && <ColumnDataString />}
      {columnType === 'Number' && <ColumnDataNumber />}
      {columnType === 'Boolean' && <ColumnDataBoolean />}
      {columnType === 'Object' && <ColumnDataObject />}
      {columnType === 'Vector' && <ColumnDataVector />}
    </StyledProfilingData>
  );
};

const ColumnDataString = () => {
  return (
    <Flex style={{ flexWrap: 'wrap' }}>
      <Section.Frequency />
      <Section title="Distinct values">123</Section>
      <Section title="Non-empty" isHalf>
        123
      </Section>
      <Section title="Empty" isHalf>
        123
      </Section>
      <Section title="Char length min" isHalf>
        123
      </Section>
      <Section title="Char length max" isHalf>
        123
      </Section>
      <Section.Distribution />
    </Flex>
  );
};
const ColumnDataNumber = () => {
  return <Section>this is a number</Section>;
};
const ColumnDataBoolean = () => {
  return <Section>this is a bool</Section>;
};
const ColumnDataObject = () => {
  return <Section>this is a object</Section>;
};
const ColumnDataVector = () => {
  return <Section>this is a vector</Section>;
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
