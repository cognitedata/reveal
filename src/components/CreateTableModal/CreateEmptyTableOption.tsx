import React from 'react';

import { Body, Colors, Detail, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

type CreateEmptyTableOptionProps = {
  isDisabled?: boolean;
  isSelected?: boolean;
  onClick: () => void;
};

const CreateEmptyTableOption = ({
  isDisabled,
  isSelected,
  onClick,
}: CreateEmptyTableOptionProps): JSX.Element => {
  return (
    <StyledCreateEmptyTableWrapper
      $isSelected={isSelected}
      disabled={isDisabled}
      onClick={onClick}
    >
      <StyledCreateEmptyTableIcon size={32} type="DataTable" />
      <StyledCreateEmptyTableTitle level={6} strong>
        Create an empty table
      </StyledCreateEmptyTableTitle>
      <StyledCreateEmptyTableDetail strong>
        Upload files later or write data directly using the API.
      </StyledCreateEmptyTableDetail>
    </StyledCreateEmptyTableWrapper>
  );
};

const StyledCreateEmptyTableIcon = styled(Icon)`
  color: ${Colors['border-default'].hex()};
`;

const StyledCreateEmptyTableWrapper = styled.button<{ $isSelected?: boolean }>`
  align-items: center;
  background-color: inherit;
  border: 1px solid ${Colors['border-default'].hex()};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  padding: 36px;
  width: 100%;

  &:hover {
    background-color: ${Colors['bg-hover'].hex()};
    border-color: ${Colors['bg-status-small--accent'].hex()};

    ${StyledCreateEmptyTableIcon} {
      color: ${Colors['bg-status-small--accent'].hex()};
    }
  }

  &:active {
    background-color: ${Colors['bg-selected'].hex()};
    border: 2px solid ${Colors['bg-status-small--accent-hover'].hex()};
    padding: 35px;

    ${StyledCreateEmptyTableIcon} {
      color: ${Colors['bg-status-small--accent-hover'].hex()};
    }
  }

  ${({ $isSelected }) =>
    $isSelected
      ? `
      background-color: ${Colors['bg-selected'].hex()};
      border: 2px solid ${Colors['bg-status-small--accent-hover'].hex()};
      padding: 35px;
  
      ${StyledCreateEmptyTableIcon} {
        color: ${Colors['bg-status-small--accent-hover'].hex()};
      }`
      : ''};

  ${({ disabled }) =>
    disabled
      ? `
      cursor: disabled;
      pointer-events: none;`
      : ''};
`;

const StyledCreateEmptyTableTitle = styled(Body)`
  color: ${Colors['text-primary'].hex()};
  margin: 16px 0 8px;
`;

const StyledCreateEmptyTableDetail = styled(Detail)`
  color: ${Colors['text-hint'].hex()};
  text-align: center;
`;

export default CreateEmptyTableOption;
