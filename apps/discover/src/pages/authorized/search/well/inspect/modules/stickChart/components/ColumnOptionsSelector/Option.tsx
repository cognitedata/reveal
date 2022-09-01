import { Icon } from '@cognite/cogs.js';

import { Dropdown } from 'components/Dropdown';
import { Flex } from 'styles/layout';

import { SelectedOptionIconWrapper } from './elements';

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
      <Flex>{option}</Flex>

      {isSelected && (
        <SelectedOptionIconWrapper>
          <Icon type="Checkmark" />
        </SelectedOptionIconWrapper>
      )}
    </Dropdown.Item>
  );
};
