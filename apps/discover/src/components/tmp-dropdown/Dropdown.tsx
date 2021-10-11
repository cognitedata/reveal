import React from 'react';

import {
  Dropdown as CogsDropdown,
  DropdownProps,
  Icon,
  Menu,
} from '@cognite/cogs.js';

import { ButtonNoPropagation } from 'components/ButtonNoPropagation';

import { ActiveMenuItem } from './elements';

type Value = number;
type Display = string | React.ReactNode;

export interface Props extends Omit<DropdownProps, 'children'> {
  selected?: Value;
  options: { value: Value; display: Display }[];
  children: React.ReactNode;
  onChange: (value: Value) => void;
}

export const Dropdown: React.FC<Props> = ({
  options,
  selected,
  onChange,
  children,
  ...rest
}) => {
  const handleOnChange = (value: Value) => {
    onChange(value);
  };

  const menuContent = () => {
    return (
      <Menu>
        {options.map((option) => (
          <Menu.Item
            key={option.value}
            disabled={selected === option.value}
            onClick={() => handleOnChange(option.value)}
          >
            <div data-testid="status-select-items">
              {selected === option.value ? (
                <ActiveMenuItem>
                  {option.display} <Icon type="Checkmark" />
                </ActiveMenuItem>
              ) : (
                option.display
              )}
            </div>
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  return (
    <ButtonNoPropagation>
      <CogsDropdown content={menuContent()} {...rest}>
        <>{children}</>
      </CogsDropdown>
    </ButtonNoPropagation>
  );
};

export default Dropdown;
