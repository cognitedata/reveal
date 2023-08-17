import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { Input } from '@cognite/cogs.js';

import { BaseInputProps } from '../../types';

import { InputWrapper } from './elements';
import { getDateTimeInputValue } from './utils';

export type DateTimeInputProps = BaseInputProps<Date>;

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
        onChange={(event) => {
          const input = event.target.value;

          if (isEmpty(input)) {
            onChange(undefined);
          } else {
            onChange(new Date(input));
          }
        }}
      />
    </InputWrapper>
  );
};
