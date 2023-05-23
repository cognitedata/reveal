import React, { Key } from 'react';
import { Body, Checkbox, CheckboxProps, Flex, Chip } from '@cognite/cogs.js';
import styled from 'styled-components';

export type TableFilterCheckboxProps = {
  key: Key;
  checked: boolean;
  label: string;
  count: number | string;
  onChange: (checked: boolean) => void;
} & CheckboxProps;

export const TableFilterCheckbox = ({
  key,
  checked,
  label,
  count,
  onChange,
  ...props
}: TableFilterCheckboxProps) => {
  return (
    <Flex key={key} justifyContent="space-between">
      <StyledContainer>
        <Checkbox checked={checked} onChange={onChange} {...props} name={label}>
          <Body level={2}>{label}</Body>
        </Checkbox>
      </StyledContainer>
      <StyledFilterCount label={String(count)} />
    </Flex>
  );
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  /* TODO: remove this once cogs gets fixed */
  .cogs-checkbox {
    align-items: center;
  }
`;

const StyledFilterCount = styled(Chip).attrs({ size: 'small' })`
  padding: 2px 6px !important;
`;
