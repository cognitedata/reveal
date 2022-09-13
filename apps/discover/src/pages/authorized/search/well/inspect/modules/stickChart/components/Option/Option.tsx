import { Icon } from '@cognite/cogs.js';

import { Dropdown } from 'components/Dropdown';

import { OptionWrapper, SelectedOptionIconWrapper } from './elements';

export interface OptionProps<T> {
  option: T;
  isSelected?: boolean;
  onChange: (option: T) => void;
}

export const Option = <T extends string>({
  option,
  isSelected = false,
  onChange,
}: OptionProps<T>) => {
  return (
    <Dropdown.Item onClick={() => onChange(option)}>
      <OptionWrapper $selected={isSelected}>{option}</OptionWrapper>

      <SelectedOptionIconWrapper $selected={isSelected}>
        <Icon type="Checkmark" />
      </SelectedOptionIconWrapper>
    </Dropdown.Item>
  );
};
