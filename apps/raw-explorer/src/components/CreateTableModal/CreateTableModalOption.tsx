import React from 'react';

import styled from 'styled-components';

import { Body, Colors, Detail, Icon, IconType } from '@cognite/cogs.js';

type CreateTableModalOptionProps = {
  description: string;
  icon: IconType;
  isDisabled?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  title: string;
};

const CreateTableModalOption = ({
  description,
  icon,
  isDisabled,
  isSelected,
  onClick,
  title,
}: CreateTableModalOptionProps): JSX.Element => {
  return (
    <StyledCreateOptionWrapper
      $isSelected={isSelected}
      disabled={isDisabled}
      onClick={onClick}
    >
      <StyledCreateOptionIcon size={40} type={icon} />
      <StyledCreateOptionTitle level={6} strong>
        {title}
      </StyledCreateOptionTitle>
      <StyledCreateOptionDetail strong>{description}</StyledCreateOptionDetail>
    </StyledCreateOptionWrapper>
  );
};

const StyledCreateOptionIcon = styled(Icon)`
  color: ${Colors['text-icon--muted']};
`;

const StyledCreateOptionWrapper = styled.button<{ $isSelected?: boolean }>`
  align-items: center;
  background-color: inherit;
  border: 1px solid ${Colors['border--interactive--default']};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 36px;
  width: 100%;

  &:hover {
    background-color: ${Colors['surface--interactive--toggled-hover']};
    border-color: ${Colors['border--interactive--hover']};

    ${StyledCreateOptionIcon} {
      color: ${Colors['text-icon--interactive--hover']};
    }
  }

  &:active {
    background-color: ${Colors['surface--interactive--toggled-pressed']};
    border: 2px solid ${Colors['border--interactive--toggled-default']};
    padding: 35px;

    ${StyledCreateOptionIcon} {
      color: ${Colors['text-icon--interactive--pressed']};
    }
  }

  ${({ $isSelected }) =>
    $isSelected
      ? `
      background-color: ${Colors['surface--interactive--toggled-pressed']};
      border: 2px solid ${Colors['border--interactive--toggled-default']};
      padding: 35px;
  
      ${StyledCreateOptionIcon} {
        color: ${Colors['text-icon--interactive--pressed']};
      }`
      : ''};

  ${({ disabled }) =>
    disabled
      ? `
      cursor: disabled;
      pointer-events: none;`
      : ''};
`;

const StyledCreateOptionTitle = styled(Body)`
  color: ${Colors['text-icon--strong']};
  margin: 16px 0 8px;
`;

const StyledCreateOptionDetail = styled(Detail)`
  color: ${Colors['text-icon--muted']};
  text-align: center;
`;

export default CreateTableModalOption;
