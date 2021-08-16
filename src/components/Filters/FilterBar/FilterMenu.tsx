import React, { useState } from 'react';
import { Dropdown, Menu, Button } from '@cognite/cogs.js';

type FileMenuProps = {
  options: React.ReactNode[];
};

export const FilterMenu = ({ options }: FileMenuProps): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const filterMenu = (
    <Menu>
      {options.map((option) => (
        <Menu.Item>{option}</Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown content={filterMenu} visible={isMenuOpen}>
      <Button
        icon="Down"
        iconPlacement="right"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        More filters
      </Button>
    </Dropdown>
  );
};
