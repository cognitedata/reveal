import { ChangeEvent, useMemo, useState } from 'react';

import isUndefined from 'lodash/isUndefined';

import { Input, InputType } from '@cognite/cogs.js';

import { formatDate, isDate } from '../../../../../utils/date';
import { BaseFilterInputBaseProps, BaseFilterInputType } from '../types';
import { transformValue } from '../utils';

import { Loader } from './Loader';

const COGS_INPUT_TYPE_MAP: Record<BaseFilterInputType, InputType> = {
  number: 'number',
  text: 'text',
  date: 'datetime-local',
};

export interface InputSingleProps<T extends string | number | Date>
  extends BaseFilterInputBaseProps {
  value?: T;
  onChange?: (value?: T) => void;
}

export const InputSingle = <T extends string | number | Date>({
  type = 'text',
  value,
  onChange,
  onInputChange,
  isLoading,
  ...rest
}: InputSingleProps<T>) => {
  const [isInputFocused, setInputFocused] = useState(false);

  const transformedValue = useMemo(() => {
    if (type === 'date') {
      if (isDate(value)) {
        return formatDate(value, 'YYYY-MM-DDTHH:mm');
      }
      return undefined;
    }
    return value as string | number | undefined;
  }, [type, value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const transformedInputValue = transformValue<T>(inputValue, type);

    if (isUndefined(transformedInputValue)) {
      return;
    }

    onChange?.(transformedInputValue);
    onInputChange?.(inputValue);
  };

  return (
    <>
      <Input
        {...rest}
        type={COGS_INPUT_TYPE_MAP[type]}
        value={transformedValue}
        onChange={handleChange}
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
        autoFocus={isInputFocused}
      />

      <Loader isLoading={isLoading} />
    </>
  );
};
