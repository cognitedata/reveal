import * as React from 'react';

import { formatBigNumbersWithSuffix } from '@data-exploration-lib/core';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { Checkbox } from '@cognite/cogs.js';

import {
  OptionLabel,
  OptionSecondaryLabel,
  LabelWrapper,
  OptionWrapper,
  ChildOptionsIcon,
  OptionCountDisabled,
  OptionCount,
} from '../elements';
import { OptionType } from '../types';

export interface OptionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  option: OptionType;
  checked?: boolean;
  indeterminate?: boolean;
  onChange: (isSelected: boolean) => void;
  /**
   * If there is at least one option that has child options.
   */
  hasOptionWithChildOptions?: boolean;
}

export const Option: React.FC<OptionProps> = ({
  option,
  checked = false,
  indeterminate = false,
  onChange,
  hasOptionWithChildOptions = false,
  ...rest
}) => {
  const { label, value, count, options } = option;
  const isDisabled = count === 0;
  const OptionCountChip = isDisabled ? OptionCountDisabled : OptionCount;

  return (
    <OptionWrapper data-testid="option" {...rest}>
      <LabelWrapper>
        <Checkbox
          data-testid="option-label"
          name={label || value}
          checked={checked}
          indeterminate={indeterminate}
          onChange={(_, nextState) => onChange(!!nextState)}
        >
          <OptionLabel>{label || value}</OptionLabel>
        </Checkbox>

        {options && !isEmpty(options) && (
          <OptionSecondaryLabel data-testid="option-secondary-label">
            Values: {options.length}
          </OptionSecondaryLabel>
        )}
      </LabelWrapper>

      {!isUndefined(count) && (
        <OptionCountChip>{formatBigNumbersWithSuffix(count)}</OptionCountChip>
      )}

      {hasOptionWithChildOptions && (
        <ChildOptionsIcon data-testid="child-options-icon" visible />
      )}
    </OptionWrapper>
  );
};
