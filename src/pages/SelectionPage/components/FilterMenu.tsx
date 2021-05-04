import React from 'react';
import { Dropdown, Menu, Button } from '@cognite/cogs.js';

export default function FilterMenu(): JSX.Element {
  const filterMenu = (
    <Menu>
      <Menu.Header>Shortcuts</Menu.Header>
      <Menu.Item disabled>Select all</Menu.Item>
      <Menu.Item disabled appendIcon="Info">
        From the previous step
      </Menu.Item>
      <Menu.Item disabled appendIcon="Info">
        Linked files
      </Menu.Item>
      <Menu.Divider />
      <Menu.Header>More filters</Menu.Header>
      <Menu.Submenu
        content={
          <Menu>
            <Menu.Item disabled>Some option</Menu.Item>
            <Menu.Item disabled>Some other option</Menu.Item>
          </Menu>
        }
      >
        <>File type</>
      </Menu.Submenu>
    </Menu>
  );

  return (
    <Dropdown content={filterMenu}>
      <Button icon="Down" iconPlacement="right">
        Filters
      </Button>
    </Dropdown>
  );
}
