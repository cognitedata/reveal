import React from 'react';

import { EMPTY_ARRAY, useDialog } from '@data-exploration-lib/core';
import { capitalize } from 'lodash';

import { Button, Dropdown, Flex, Menu } from '@cognite/cogs.js';

import { Bar, Separator, Subtitle, Wrapper, Title } from './elements';

export interface BulkActionbarOptions {
  name: string;
  type: string;
}

export interface BulkActionbarProps {
  isVisible: boolean;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  options?: BulkActionbarOptions[];
}

export const BulkActionbar = ({
  isVisible,
  title,
  subtitle,
  children,
  options = EMPTY_ARRAY,
}: BulkActionbarProps) => {
  const { isOpen, toggle } = useDialog();
  return (
    <Wrapper visible={isVisible} data-testid="table-bulk-actions">
      <Bar>
        <Flex alignItems="center" gap={8}>
          <Dropdown
            content={
              <Menu style={{ height: 200, overflow: 'auto' }}>
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
            <Subtitle>{subtitle}</Subtitle>
            <Title>{title}</Title>
          </Flex>
        </Flex>
        <Flex alignItems="center">{children}</Flex>
      </Bar>
    </Wrapper>
  );
};

BulkActionbar.Separator = Separator;
