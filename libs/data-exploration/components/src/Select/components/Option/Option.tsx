import { components, OptionProps, OptionTypeBase } from 'react-select';

import { Flex } from '@cognite/cogs.js';

import { formatBigNumbersWithSuffix } from '@data-exploration-lib/core';

import isUndefined from 'lodash/isUndefined';

import { Ellipsis } from '../../../Ellipsis';
import { OptionCheckbox, OptionCount } from './elements';

export const Option = <OptionType extends OptionTypeBase>({
  data,
  isSelected,
  ...props
}: OptionProps<OptionType>) => {
  const { label, count } = data;

  return (
    <components.Option
      {...props}
      data={data}
      isSelected={isSelected}
      isFocused={false}
    >
      <Flex>
        <OptionCheckbox checked={isSelected} />

        <Ellipsis value={label} />

        {!isUndefined(count) && (
          <OptionCount
            type="neutral"
            size="x-small"
            label={formatBigNumbersWithSuffix(count)}
          />
        )}
      </Flex>
    </components.Option>
  );
};
