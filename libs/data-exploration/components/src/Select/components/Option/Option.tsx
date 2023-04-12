import { components, OptionProps, OptionTypeBase } from 'react-select';

import { Checkbox } from '@cognite/cogs.js';

import { formatBigNumbersWithSuffix } from '@data-exploration-lib/core';

import isUndefined from 'lodash/isUndefined';

import { Ellipsis } from '../../../Ellipsis';
import { OptionContentWrapper, OptionCount } from './elements';

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
      <OptionContentWrapper>
        <Checkbox checked={isSelected} />

        <Ellipsis value={label} />

        {!isUndefined(count) && (
          <OptionCount>{formatBigNumbersWithSuffix(count)}</OptionCount>
        )}
      </OptionContentWrapper>
    </components.Option>
  );
};
