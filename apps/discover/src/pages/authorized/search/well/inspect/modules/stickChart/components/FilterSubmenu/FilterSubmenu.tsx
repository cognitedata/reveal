import * as React from 'react';
import { useMemo } from 'react';

import { Menu, Body } from '@cognite/cogs.js';

import { OptionsContainer, SelectorContainer } from './elements';

export interface FilterSubmenuProps<T> {
  title: string;
  selectedOption: T;
  options: T[];
  onChange: (unit: T) => void;
}

export const FilterSubmenu = <T extends string>({
  title,
  selectedOption,
  options,
  onChange,
}: FilterSubmenuProps<T>) => {
  const Options = useMemo(() => {
    return (
      <OptionsContainer>
        {options.map((option) => {
          return (
            <Menu.Item
              key={option}
              appendIcon={selectedOption === option ? 'Checkmark' : undefined}
              selected={selectedOption === option}
              onClick={() => onChange(option)}
            >
              {option}
            </Menu.Item>
          );
        })}
      </OptionsContainer>
    );
  }, [options, selectedOption]);

  return (
    <Menu.Submenu
      appendTo={document.body}
      openOnHover
      placement="right-start"
      content={Options}
    >
      <SelectorContainer>
        <Body level={2} strong>
          {title}
        </Body>
        <Body level={3}>{selectedOption}</Body>
      </SelectorContainer>
    </Menu.Submenu>
  );
};
