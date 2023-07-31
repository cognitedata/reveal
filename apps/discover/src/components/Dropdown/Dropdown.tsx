import React, { useCallback, useMemo, useState } from 'react';

import { Instance } from '@tippyjs/react/node_modules/tippy.js';

import { Dropdown as CogsDropdown, Menu } from '@cognite/cogs.js';

import { DropdownContext, useDropdownContext } from './context';
import {
  DropdownItemProps,
  DropdownProps,
  DropdownSubmenuProps,
} from './types';

export const Dropdown = ({
  hideOnSelect = true,
  onClickOutside,
  children,
  ...props
}: DropdownProps) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const contextValue = useMemo(
    () => ({ hideOnSelect, dropdownVisible, setDropdownVisible }),
    [hideOnSelect, dropdownVisible, setDropdownVisible]
  );

  const toggleDropdownVisible = () => {
    setDropdownVisible((dropdownVisible) => !dropdownVisible);
  };

  const handleClickOutside = useCallback(
    (instance: Instance, event: Event) => {
      onClickOutside?.(instance, event);
      if (hideOnSelect) {
        setDropdownVisible(false);
      }
    },
    [setDropdownVisible, onClickOutside, hideOnSelect]
  );

  return (
    <DropdownContext.Provider value={contextValue}>
      <CogsDropdown
        visible={dropdownVisible}
        {...props}
        onClickOutside={handleClickOutside}
      >
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <span onMouseDown={toggleDropdownVisible}>{children}</span>
      </CogsDropdown>
    </DropdownContext.Provider>
  );
};

const DropdownItem = ({ onClick, ...otherProps }: DropdownItemProps) => {
  const { hideOnSelect, setDropdownVisible } = useDropdownContext();

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    onClick?.(e);
    if (hideOnSelect) {
      setDropdownVisible(false);
    }
  };

  return <Menu.Item {...otherProps} onClick={handleClick} />;
};

const DropdownSubmenu = (props: DropdownSubmenuProps) => {
  const { hideOnSelect } = useDropdownContext();
  return <Menu.Submenu {...props} hideOnSelect={hideOnSelect} />;
};

Dropdown.Menu = Menu;
Dropdown.Submenu = DropdownSubmenu;
Dropdown.Item = DropdownItem;
Dropdown.Header = Menu.Header;
Dropdown.Footer = Menu.Footer;
Dropdown.Divider = Menu.Divider;
