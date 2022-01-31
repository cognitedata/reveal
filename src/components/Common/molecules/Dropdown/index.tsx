import React, { useState } from 'react';
import {
  Button,
  AllIconTypes,
  Dropdown as CogsDropdown,
} from '@cognite/cogs.js';

type Props = {
  content: React.ReactNode;
  dropdownDisabled?: boolean;
  buttonDisabled?: boolean;
  icon?: AllIconTypes;
};

export const Dropdown = (props: Props) => {
  const {
    content,
    dropdownDisabled,
    buttonDisabled,
    icon = 'EllipsisHorizontal',
  } = props;
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

  return (
    <CogsDropdown
      content={content}
      disabled={dropdownDisabled}
      visible={isMenuVisible}
      onClickOutside={() => setIsMenuVisible(false)}
    >
      <Button
        aria-label="Button-Dropdown-Menu"
        type="ghost"
        icon={icon}
        toggled={isMenuVisible}
        disabled={buttonDisabled}
        onClick={() => setIsMenuVisible(!isMenuVisible)}
      />
    </CogsDropdown>
  );
};

export * from './DropdownMenu';
