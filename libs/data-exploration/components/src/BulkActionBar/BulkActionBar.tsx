import React from 'react';

import { capitalize } from 'lodash';

import { Button, Dropdown, Flex, Menu } from '@cognite/cogs.js';

import { EMPTY_ARRAY, useDialog } from '@data-exploration-lib/core';

import { Bar, Separator, Title, Subtitle, Wrapper } from './elements';

export interface BulkActionBarOptions {
  name: string;
  type: string;
}

export interface BulkActionBarProps {
  isVisible: boolean;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  options?: BulkActionBarOptions[];
}

export const BulkActionBar = ({
  isVisible,
  title,
  subtitle,
  children,
  options = EMPTY_ARRAY,
}: BulkActionBarProps) => {
  const { isOpen, toggle } = useDialog();
  return (
    <Wrapper visible={isVisible} data-testid="table-bulk-actions">
      <Bar>
        <Flex alignItems="center" gap={8}>
          <Dropdown
            content={
              <Menu style={{ maxHeight: 300, overflow: 'auto' }}>
                <Menu.Header>Selected</Menu.Header>
                {options.map((option) => (
                  <Menu.Item
                    key={option.name}
                    description={capitalize(option.type)}
                  >
                    {option.name}
                  </Menu.Item>
                ))}
              </Menu>
            }
          >
            <Button
              size="small"
              inverted
              aria-label="Dropdown"
              onClick={toggle}
              icon={isOpen ? 'ChevronUp' : 'ChevronDown'}
            />
          </Dropdown>
          <Flex direction="column">
            <Title>{title}</Title>
            <Subtitle>{subtitle}</Subtitle>
          </Flex>
        </Flex>
        <Flex alignItems="center">{children}</Flex>
      </Bar>
    </Wrapper>
  );
};

BulkActionBar.Separator = Separator;
