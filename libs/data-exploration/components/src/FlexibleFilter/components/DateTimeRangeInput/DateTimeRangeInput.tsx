import * as React from 'react';
import { useState } from 'react';

import isUndefined from 'lodash/isUndefined';

import { DateTimeInput } from '../DateTimeInput';
import { Chip, Container } from './elements';
import { InputControlProps } from '../../types';

export type DateTimeRangeInputProps = InputControlProps<'date-range'>;

export const DateTimeRangeInput: React.FC<DateTimeRangeInputProps> = ({
  value,
  onChange,
}) => {
  const [min, setMin] = useState<Date | undefined>(value?.[0]);
  const [max, setMax] = useState<Date | undefined>(value?.[1]);

  return (
    <Container>
      <DateTimeInput
        value={min}
        onChange={(newMin) => {
          setMin(newMin);

          if (!isUndefined(max)) {
            onChange([newMin, max]);
          }
        }}
      />

      <Chip>AND</Chip>

      <DateTimeInput
        value={max}
        onChange={(newMax) => {
          setMax(newMax);

          if (!isUndefined(min)) {
            onChange([min, newMax]);
          }
        }}
      />
    </Container>
  );
};
