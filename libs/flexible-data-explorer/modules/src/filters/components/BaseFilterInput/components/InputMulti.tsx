import { useMemo, useState } from 'react';

import { isNumeric } from '@fdx/shared/utils/number';
import isUndefined from 'lodash/isUndefined';
import last from 'lodash/last';
import styled from 'styled-components/macro';

import { OptionType, Select } from '@cognite/cogs.js';

import { BaseFilterInputBaseProps } from '../types';

import { Loader } from './Loader';

export interface InputMultiProps<T extends string | number | Date>
  extends BaseFilterInputBaseProps {
  value?: T[];
  onChange?: (value?: T[]) => void;
}

export const InputMulti = <T extends string | number>({
  type = 'text',
  helpText,
  isLoading,
  value,
  onChange,
  onInputChange,
  ...rest
}: InputMultiProps<T>) => {
  const [inputValue, setInputValue] = useState<string>('');

  /**
   * We cannot restrict the 'Select' input as a numeric input.
   * Hence we have to manually control if the input type is set to 'number'.
   */
  const handleInputChange = (newInputValue: string) => {
    // Nothing to control manually if the input type is 'text'.
    if (type === 'text') {
      setInputValue(newInputValue);
      onInputChange?.(newInputValue);
      return;
    }

    /**
     * Get the last character of the input value.
     * So we can check if the last entered character is a number or not.
     */
    const lastCharacter = last(newInputValue);

    /**
     * This condition is hit when a umeric value is cleared.
     * This is needed to clear the last remaining number in the input.
     */
    if (isUndefined(lastCharacter)) {
      setInputValue('');
      onInputChange?.('');
      return;
    }

    // Check if the last entered character is numeric.
    if (isNumeric(lastCharacter)) {
      setInputValue(newInputValue);
      onInputChange?.(newInputValue);
      return;
    }
  };

  const handleChange = (options: OptionType<T>[]) => {
    const values = options.map((option) => option.value as T);
    onChange?.(values);
  };

  const selectValue = useMemo(() => {
    return value?.map((item) => ({
      label: String(item),
      value: item,
    }));
  }, [value]);

  return (
    <Wrapper displayIconRight={isLoading}>
      <Select
        {...rest}
        isMulti
        options={[]}
        value={selectValue}
        menuIsOpen={false}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={handleChange}
      />

      <Loader isLoading={isLoading} />

      <HelpText>{helpText}</HelpText>
    </Wrapper>
  );
};

const Wrapper = styled.div<{ displayIconRight?: boolean }>`
  .cogs-select__dropdown-indicator {
    ${({ displayIconRight }) =>
      displayIconRight ? `visibility: hidden;` : `display: none;`}
  }
  .cogs-select__multi-value {
    background: var(--cogs-surface--status-neutral--muted--default);
    color: var(--cogs-text-icon--status-neutral);
  }
  .cogs-select__multi-value__label {
    color: var(--cogs-text-icon--status-neutral);
  }
`;

const HelpText = styled.p`
  color: var(--cogs-text-secondary);
  margin-top: 2px;
  margin-left: 2px;
  font-size: 12px;
  line-height: 16px;
`;
