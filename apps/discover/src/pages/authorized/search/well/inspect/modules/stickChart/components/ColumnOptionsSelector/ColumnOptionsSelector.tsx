import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { Icon } from '@cognite/cogs.js';

import { Dropdown } from 'components/Dropdown';
import { EMPTY_ARRAY } from 'constants/empty';

import { BodyColumnMainHeader } from '../../../common/Events/elements';
import { Option } from '../Option';

import {
  ColumnOptionsSelectorContainer,
  ColumnOptionsSelectorIconWrapper,
} from './elements';

export interface ColumnOptionsSelectorProps<T> {
  options?: T[];
  selectedOption?: T;
  displayValue?: T | string;
  width?: number;
  onChange: (selectedOption: T) => void;
}

export const ColumnOptionsSelector = <T extends string>({
  options = EMPTY_ARRAY,
  selectedOption,
  displayValue,
  width,
  onChange,
}: ColumnOptionsSelectorProps<T>) => {
  const renderDropdownContent = () => {
    if (isEmpty(options)) {
      return null;
    }

    return (
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
    );
  };

  return (
    <Dropdown placement="bottom-end" content={renderDropdownContent()}>
      <ColumnOptionsSelectorContainer>
        <div style={{ width }}>
          <BodyColumnMainHeader>
            {displayValue || selectedOption}
          </BodyColumnMainHeader>
        </div>

        {!isEmpty(options) && (
          <ColumnOptionsSelectorIconWrapper>
            <Icon type="ChevronDownSmall" data-testid="chevron-down-icon" />
          </ColumnOptionsSelectorIconWrapper>
        )}
      </ColumnOptionsSelectorContainer>
    </Dropdown>
  );
};
