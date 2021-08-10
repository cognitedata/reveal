import React from 'react';
import { Dropdown, Menu, Button } from '@cognite/cogs.js';

type FileMenuProps = {
  options: React.ReactNode[];
};

export const FilterMenu = ({ options }: FileMenuProps): JSX.Element => {
  const filterMenu = (
    <Menu>
      {options.map((option) => (
        <Menu.Item>{option}</Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown content={filterMenu}>
      <Button icon="Down" iconPlacement="right">
        More filters
      </Button>
    </Dropdown>
  );
};
