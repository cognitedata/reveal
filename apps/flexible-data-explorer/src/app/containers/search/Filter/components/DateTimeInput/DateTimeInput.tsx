import * as React from 'react';

import { Input } from '@cognite/cogs.js';

import { InputControlProps } from '../../types';
import { InputWrapper } from './elements';
import { getDateTimeInputValue } from './utils';

export type DateTimeInputProps = InputControlProps<'date'>;

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <InputWrapper>
      <Input
        type="datetime-local"
        icon="Calendar"
        value={value && getDateTimeInputValue(value)}
        onChange={(event) => onChange(new Date(event.target.value))}
      />
    </InputWrapper>
  );
};
