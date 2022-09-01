import * as React from 'react';

import { Icon } from '@cognite/cogs.js';

import { Dropdown } from 'components/Dropdown';

import { BodyColumnMainHeader } from '../../../common/Events/elements';

import {
  ColumnOptionsSelectorContainer,
  ColumnOptionsSelectorIconWrapper,
} from './elements';
import { Option } from './Option';

export interface ColumnOptionsSelectorProps<T> {
  options: T[];
  selectedOption: T;
  displayValue?: T | string;
  width?: number;
  onChange: (selectedOption: T) => void;
}

export const ColumnOptionsSelector = <T extends string>({
  options,
  selectedOption,
  displayValue,
  width,
  onChange,
}: ColumnOptionsSelectorProps<T>) => {
  return (
    <Dropdown
      placement="bottom-end"
      content={
        <Dropdown.Menu>
          {options.map((option) => (
            <Option
              key={option}
              option={option}
              isSelected={option === selectedOption}
              onChange={onChange}
            />
          ))}
        </Dropdown.Menu>
      }
    >
      <ColumnOptionsSelectorContainer>
        <div style={{ width }}>
          <BodyColumnMainHeader>
            {displayValue || selectedOption}
          </BodyColumnMainHeader>
        </div>

        <ColumnOptionsSelectorIconWrapper>
          <Icon type="ChevronDown" size={14} />
        </ColumnOptionsSelectorIconWrapper>
      </ColumnOptionsSelectorContainer>
    </Dropdown>
  );
};
