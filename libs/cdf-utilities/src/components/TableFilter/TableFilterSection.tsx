import React from 'react';
import styled from 'styled-components';
import { Body, Colors, Flex } from '@cognite/cogs.js';

import {
  TableFilterCheckbox,
  TableFilterCheckboxProps,
} from './TableFilterCheckbox';
import { TableFilterSelect, TableFilterSelectProps } from './TableFilterSelect';

type InputsType =
  | ({ filterInputType: 'checkbox' } & TableFilterCheckboxProps)
  | ({ filterInputType: 'select' } & TableFilterSelectProps);

export type TableFilterSectionProps = {
  title: string;
  inputs: InputsType[];
};

export const TableFilterSection = ({
  title,
  inputs,
}: TableFilterSectionProps) => {
  return (
    <StyledContainer>
      <Flex gap={6} direction="column">
        <Body level="3" strong>
          {title}
        </Body>
        <Flex direction="column" gap={8}>
          {inputs?.map((props) => (
            <TableFilterInputMatcher {...props} key={props.key} />
          ))}
        </Flex>
      </Flex>
    </StyledContainer>
  );
};

const TableFilterInputMatcher = ({ filterInputType, ...props }: InputsType) => {
  switch (filterInputType) {
    case 'checkbox': {
      return <TableFilterCheckbox {...(props as TableFilterCheckboxProps)} />;
    }
    case 'select': {
      return <TableFilterSelect {...(props as TableFilterSelectProps)} />;
    }
    default:
      return <>{null}</>;
  }
};

const StyledContainer = styled.div`
  padding: 12px;

  &:not(:last-child) {
    border-bottom: 1px solid ${Colors['border--muted']};
  }
`;
