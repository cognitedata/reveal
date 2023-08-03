import { components, OptionProps, OptionTypeBase } from 'react-select';

import isUndefined from 'lodash/isUndefined';

import { Checkbox, Divider } from '@cognite/cogs.js';

import {
  EMPTY_LABEL,
  formatBigNumbersWithSuffix,
  NOT_SET,
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
}: // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
OptionProps<OptionType>) => {
  // eslint-disable-next-line prefer-const
  let { label, count } = data;
  const { addNilOption } = props.selectProps;
  const isDisabled = count === 0;

  if (label === '') {
    label = EMPTY_LABEL;
  }
  if (isUndefined(label)) {
    label = NOT_SET;
  }
  const OptionCountChip = isDisabled ? OptionCountDisabled : OptionCount;

  const isDividerVisible = addNilOption && label === NOT_SET;

  return (
    <>
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
            <OptionCountChip>
              {formatBigNumbersWithSuffix(count)}
            </OptionCountChip>
          )}
        </OptionContentWrapper>
      </components.Option>
      {isDividerVisible && <Divider />}
    </>
  );
};
