import * as React from 'react';
import { useState } from 'react';

import { DateTimeInput } from '../DateTimeInput';
import { Chip, Container } from './elements';

export interface DateTimeRangeInputProps {
  value?: [Date, Date];
  onChange: (range: [Date | undefined, Date | undefined]) => void;
}

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
          onChange([newMin, max]);
        }}
      />

      <Chip>AND</Chip>

      <DateTimeInput
        value={max}
        onChange={(newMax) => {
          setMax(newMax);
          onChange([min, newMax]);
        }}
      />
    </Container>
  );
};
