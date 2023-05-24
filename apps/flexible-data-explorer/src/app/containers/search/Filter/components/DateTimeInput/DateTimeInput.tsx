import * as React from 'react';

import { Input } from '@cognite/cogs.js';

import { InputWrapper } from './elements';
import { getDateTimeInputValue } from './utils';
import { InputControlProps } from '../../types';

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
