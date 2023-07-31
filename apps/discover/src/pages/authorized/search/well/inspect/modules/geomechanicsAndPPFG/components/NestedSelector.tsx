import * as React from 'react';

import { Dropdown, Menu } from '@cognite/cogs.js';

import { MoreOptionsButton } from 'components/Buttons';

import {
  UnitCategoryBody,
  UnitCategoryHeader,
  UnitCategoryValue,
  UnitSelectorMainMenu,
  UnitSelectorWrapper,
} from './elements';

export interface NestedSelectorOption<T> {
  key: keyof T;
  label: string;
  options: T[keyof T][];
}

export interface NestedSelectorProps<T> {
  id: string;
  options: NestedSelectorOption<T>[];
  value: T;
  onChange: (key: keyof T, option: T[keyof T]) => void;
}

export const NestedSelector = <T extends object>({
  id,
  options,
  value,
  onChange,
}: NestedSelectorProps<T>) => {
  const content = options.map(({ key, label, options }) => {
    const selectedOption = value[key];

    return (
      <Menu id={String(key)} key={String(key)}>
        <Menu.Submenu
          content={
            <UnitSelectorMainMenu>
              {options.map((option) => (
                <Menu.Item
                  key={String(option)}
                  appendIcon={
                    selectedOption === option ? 'Checkmark' : undefined
                  }
                  selected={selectedOption === option}
                  onClick={() => onChange(key, option)}
                >
                  {String(option)}
                </Menu.Item>
              ))}
            </UnitSelectorMainMenu>
          }
        >
          <UnitCategoryBody>
            <UnitCategoryHeader>{label}</UnitCategoryHeader>
            <UnitCategoryValue>{selectedOption}</UnitCategoryValue>
          </UnitCategoryBody>
        </Menu.Submenu>
      </Menu>
    );
  });

  return (
    <UnitSelectorWrapper>
      <Dropdown appendTo={document.body} openOnHover content={content}>
        <MoreOptionsButton data-testid={id} size="default" />
      </Dropdown>
    </UnitSelectorWrapper>
  );
};
