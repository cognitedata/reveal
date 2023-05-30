import { components, OptionProps, OptionTypeBase } from 'react-select';

import isUndefined from 'lodash/isUndefined';

import { Checkbox } from '@cognite/cogs.js';

import {
  formatBigNumbersWithSuffix,
  NIL_FILTER_LABEL,
} from '@data-exploration-lib/core';

import { Ellipsis } from '../../../Ellipsis';

import {
  OptionContentWrapper,
  OptionCount,
  OptionCountDisabled,
} from './elements';

export const Option = <OptionType extends OptionTypeBase>({
  data,
  isSelected,
  ...props
}: OptionProps<OptionType>) => {
  // eslint-disable-next-line prefer-const
  let { label, count } = data;
  const isDisabled = count === 0;

  if (!label) {
    label = NIL_FILTER_LABEL;
  }
  const OptionCountChip = isDisabled ? OptionCountDisabled : OptionCount;

  return (
    <components.Option
      {...props}
      data={data}
      isSelected={isSelected}
      isFocused={false}
      isDisabled={isDisabled}
    >
      <OptionContentWrapper>
        <Checkbox checked={isSelected} disabled={isDisabled} />

        <Ellipsis value={label} />

        {!isUndefined(count) && (
          <OptionCountChip>{formatBigNumbersWithSuffix(count)}</OptionCountChip>
        )}
      </OptionContentWrapper>
    </components.Option>
  );
};
