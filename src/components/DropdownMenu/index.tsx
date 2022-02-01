import React, { useState } from 'react';
import {
  Button,
  IconType,
  Dropdown as CogsDropdown,
  Colors,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { Flex } from 'components/Flex';

interface DropdownProps {
  content: React.ReactNode;
  dropdownDisabled?: boolean;
  buttonDisabled?: boolean;
  icon?: IconType;
}

interface DropdownMenuContentProps {
  actions: Array<{
    label: string;
    onClick: () => void;
    key: string;
    disabled?: boolean;
    loading?: boolean;
    icon?: IconType;
  }>;
}

export const Dropdown = ({
  content,
  dropdownDisabled,
  buttonDisabled,
  icon = 'EllipsisHorizontal',
}: DropdownProps) => {
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

  return (
    <CogsDropdown
      content={content}
      disabled={dropdownDisabled}
      visible={isMenuVisible}
      onClickOutside={() => setIsMenuVisible(false)}
      placement="bottom-end"
    >
      <Button
        aria-label="Button-Dropdown-Menu"
        type="ghost"
        icon={icon}
        toggled={isMenuVisible}
        disabled={buttonDisabled}
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuVisible(!isMenuVisible);
        }}
      />
    </CogsDropdown>
  );
};

export const DropdownMenuContent = ({ actions }: DropdownMenuContentProps) => {
  return (
    <DropdownMenu column justify grow style={{ width: '150px' }}>
      {actions.map(({ label, onClick, key, disabled, loading, icon }) => (
        <MenuButton
          key={key}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          disabled={disabled || loading}
          loading={loading}
          icon={icon}
          type="ghost"
        >
          {label}
        </MenuButton>
      ))}
    </DropdownMenu>
  );
};

const DropdownMenu = styled(Flex)`
  flex-direction: column;
  align-items: flex-start;
  border-radius: 8px;
  padding: 8px 4px;
  background-color: white;
  box-shadow: 0 0 10px ${Colors['greyscale-grey3'].hex()};
  width: auto;
  & > * {
    flex: 1 1 0px;
    width: 100%;
    justify-content: flex-start;
  }
`;

const MenuButton = styled(Button)`
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  background-color: ${(props) => props.disabled && 'transparent'};
  color: ${(props) =>
    props.disabled && props.type === 'ghost-danger' && Colors['red-2'].hex()};

  &:hover {
    cursor: ${(props) => props.disabled && 'not-allowed'};
    background-color: ${(props) => props.disabled && 'transparent'};
    color: ${(props) =>
      props.disabled && props.type === 'ghost-danger' && Colors['red-2'].hex()};
  }
`;
