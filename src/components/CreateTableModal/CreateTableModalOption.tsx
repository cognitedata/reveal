import React from 'react';

import { AllIconTypes, Body, Colors, Detail, Icon } from '@cognite/cogs.js';
import icons, { IconType } from 'assets/icons';
import styled from 'styled-components';
import { CustomIcon } from 'components/CustomIcon';

type CreateTableModalOptionProps = {
  description: string;
  icon: AllIconTypes | IconType;
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
  const customIconKeys = Object.keys(icons);

  return (
    <StyledCreateOptionWrapper
      $isSelected={isSelected}
      disabled={isDisabled}
      onClick={onClick}
    >
      {customIconKeys.includes(icon) ? (
        <CustomIcon icon={icon as IconType} style={{ width: 32 }} />
      ) : (
        <StyledCreateOptionIcon size={32} type={icon as AllIconTypes} />
      )}
      <StyledCreateOptionTitle level={6} strong>
        {title}
      </StyledCreateOptionTitle>
      <StyledCreateOptionDetail strong>{description}</StyledCreateOptionDetail>
    </StyledCreateOptionWrapper>
  );
};

const StyledCreateOptionIcon = styled(Icon)`
  color: ${Colors['border-default'].hex()};
`;

const StyledCreateOptionWrapper = styled.button<{ $isSelected?: boolean }>`
  align-items: center;
  background-color: inherit;
  border: 1px solid ${Colors['border-default'].hex()};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 36px;
  width: 100%;

  &:hover {
    background-color: ${Colors['bg-hover'].hex()};
    border-color: ${Colors['bg-status-small--accent'].hex()};

    ${StyledCreateOptionIcon} {
      color: ${Colors['bg-status-small--accent'].hex()};
    }
  }

  &:active {
    background-color: ${Colors['bg-selected'].hex()};
    border: 2px solid ${Colors['bg-status-small--accent-hover'].hex()};
    padding: 35px;

    ${StyledCreateOptionIcon} {
      color: ${Colors['bg-status-small--accent-hover'].hex()};
    }
  }

  ${({ $isSelected }) =>
    $isSelected
      ? `
      background-color: ${Colors['bg-selected'].hex()};
      border: 2px solid ${Colors['bg-status-small--accent-hover'].hex()};
      padding: 35px;
  
      ${StyledCreateOptionIcon} {
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

const StyledCreateOptionTitle = styled(Body)`
  color: ${Colors['text-primary'].hex()};
  margin: 16px 0 8px;
`;

const StyledCreateOptionDetail = styled(Detail)`
  color: ${Colors['text-hint'].hex()};
  text-align: center;
`;

export default CreateTableModalOption;
