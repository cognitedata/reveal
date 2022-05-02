import { useEffect, useState, useCallback } from 'react';

import isEmpty from 'lodash/isEmpty';

import { Input } from '@cognite/cogs.js';

import { NumberInputWrapper } from './elements';
import { NumberInputProps } from './types';

export const NumberInput: React.FC<NumberInputProps> = ({
  range,
  value,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState<number>(value);

  const [min, max] = range;

  useEffect(() => setInputValue(value), [value]);

  const handleOnChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;

      if (isEmpty(inputValue)) return onChange(0);

      const newValue = parseFloat(inputValue);

      if (newValue < min) return onChange(min);
      if (newValue > max) return onChange(max);
      return onChange(newValue);
    },
    [range]
  );

  const handleOnBlur = useCallback(() => setInputValue(value), [value]);

  return (
    <NumberInputWrapper>
      <Input
        data-testid="number-input"
        type="number"
        value={inputValue}
        min={min}
        max={max}
        step={0.1}
        setValue={onChange}
        onChange={handleOnChange}
        onBlur={handleOnBlur}
        fullWidth
      />
    </NumberInputWrapper>
  );
};
