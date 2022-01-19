import React, { useEffect, useState } from 'react';
import { HTMLUtils } from '@/UserInterface/Foundation/Utils/HTMLUtils';
import {
  Dropdown,
  Input,
  Menu,
  Button,
  Icon,
  ButtonProps,
} from '@cognite/cogs.js';
import styled from 'styled-components';

interface SelectableOption {
  label: string;
  value: string;
}

interface SelectableInputProps {
  options?: SelectableOption[];
  value?: string;
  onChange?: (value: string) => void;
}

const dropdownOffset = 40;

const renderMenu = (optionsList: SelectableOption[] = [], handleItemClick) => {
  return (
    <Menu>
      {optionsList.map((option) => (
        <Menu.Item
          key={option.value}
          onClick={() => handleItemClick(option.value)}
        >
          {option.label}
        </Menu.Item>
      ))}
    </Menu>
  );
};

export const SelectableInput = (props: SelectableInputProps) => {
  const { options, value, onChange } = props;
  const [displayValue, setDisplayValue] = useState(props.value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const selectedMenuItem = document.getElementById(`item-id-${value}`);
    if (selectedMenuItem) selectedMenuItem.scrollIntoView();
  });

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const updateParent = (val: string) => {
    if (onChange) {
      onChange(val);
    }
    setDisplayValue(value);
  };

  const handleEnter = (evt: any): void => {
    const val = evt.target.value;
    if (val) {
      updateParent(val);
    }
  };

  const handleMenuItemClick = (val: string): void => {
    setOpen(false);
    updateParent(val);
  };

  const handleToggle = (): void => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleValueChange = (event) => {
    setDisplayValue(event.target.value);
  };

  const handleKeyPress = (event) => {
    HTMLUtils.onEnter(handleEnter)(event);
  };

  return (
    <SelectWrapper>
      <StyledInput>
        <Input
          size="small"
          value={displayValue}
          onChange={handleValueChange}
          onKeyUp={handleKeyPress}
        />
      </StyledInput>
      <Dropdown
        visible={open}
        content={renderMenu(options, handleMenuItemClick)}
        onClickOutside={handleClose}
        offset={[-dropdownOffset, 0]}
      >
        <StyledButton size="small" onClick={handleToggle}>
          <Icon type="CaretDown" />
        </StyledButton>
      </Dropdown>
    </SelectWrapper>
  );
};

const SelectWrapper = styled.div`
  display: flex;
`;
const StyledInput = styled.div`
  input {
    border-radius: 0;
    border: 0;
    padding: 0 5px;
    width: 100%;
    min-width: ${dropdownOffset}px;
  }
`;
const StyledButton = styled(Button)`
  border-radius: 0;
  padding: 0 5px;
  width: 20px;
  height: ${(props: ButtonProps) => (props.size === 'small' ? '24px' : '')};
  max-height: 100%;
`;
