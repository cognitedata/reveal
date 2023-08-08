import React from 'react';

import {
  Avatar,
  Dropdown,
  Flex,
  Heading,
  Menu,
  Body,
  Divider,
  TopbarExp,
  useBoolean,
} from '@cognite/cogs.js';

export const SiteSelection = () => {
  const { value, toggle, setFalse } = useBoolean(false);
  return (
    <Dropdown
      visible={value}
      onClickOutside={setFalse}
      offset={[0, 18]}
      content={
        <Menu style={{ width: 288 }}>
          <Menu.Header>
            <Flex gap={10}>
              <Avatar text="Celanese" />
              <Flex direction="column">
                <Heading level={6}>Celanese</Heading>
                <Body inverted level={3}>
                  Hello world
                </Body>
              </Flex>
            </Flex>
          </Menu.Header>
          <Divider />
          <Menu.Section label="Apps">
            <Menu.Item>Clear Lake</Menu.Item>
            <Menu.Item>Bay City</Menu.Item>
            <Menu.Item>Frankfurt</Menu.Item>
          </Menu.Section>
        </Menu>
      }
    >
      <TopbarExp.Button
        onClick={toggle}
        toggled={value}
        type="ghost"
        icon="ChevronDown"
        iconPlacement="right"
      >
        Current Option
      </TopbarExp.Button>
    </Dropdown>
  );
};
