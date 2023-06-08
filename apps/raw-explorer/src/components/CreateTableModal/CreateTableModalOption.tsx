import React from 'react';

import { AllIconTypes, Body, Colors, Detail, Icon } from '@cognite/cogs.js';
import icons, { IconType } from 'common/assets/icons';
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
        <CustomIcon icon={icon as IconType} style={{ height: 40 }} />
      ) : (
        <StyledCreateOptionIcon size={40} type={icon as AllIconTypes} />
      )}
      <StyledCreateOptionTitle level={6} strong>
        {title}
      </StyledCreateOptionTitle>
      <StyledCreateOptionDetail strong>{description}</StyledCreateOptionDetail>
    </StyledCreateOptionWrapper>
  );
};

const StyledCreateOptionIcon = styled(Icon)`
  color: ${Colors['border--interactive--default']};
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
    background-color: ${Colors['surface--interactive--hover']};
    border-color: ${Colors['surface--status-neutral--muted--default']};

    ${StyledCreateOptionIcon} {
      color: ${Colors['surface--status-neutral--muted--default']};
    }
  }

  &:active {
    background-color: ${Colors['surface--interactive--pressed']};
    border: 2px solid ${Colors['surface--status-neutral--muted--default--alt']};
    padding: 35px;

    ${StyledCreateOptionIcon} {
      color: ${Colors['surface--status-neutral--muted--default--alt']};
    }
  }

  ${({ $isSelected }) =>
    $isSelected
      ? `
      background-color: ${Colors['surface--interactive--pressed']};
      border: 2px solid ${Colors['surface--status-neutral--muted--default--alt']};
      padding: 35px;
  
      ${StyledCreateOptionIcon} {
        color: ${Colors['surface--status-neutral--muted--default--alt']};
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
