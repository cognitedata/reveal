import * as React from 'react';
import { useState } from 'react';

import { Chip } from '@cognite/cogs.js';

import { NumberInput } from '../NumberInput';

import { Container } from './elements';

const PLACEHOLDER = '...';

export interface NumericRangeInputProps {
  value?: [number, number];
  onChange: (range: [number | undefined, number | undefined]) => void;
}

export const NumericRangeInput: React.FC<NumericRangeInputProps> = ({
  value,
  onChange,
}) => {
  const [min, setMin] = useState<number | undefined>(value?.[0]);
  const [max, setMax] = useState<number | undefined>(value?.[1]);

  return (
    <Container>
      <NumberInput
        placeholder={PLACEHOLDER}
        value={min}
        onChange={(newMin) => {
          setMin(newMin);
          onChange([newMin, max]);
        }}
      />

      <Chip label="AND" />

      <NumberInput
        placeholder={PLACEHOLDER}
        value={max}
        onChange={(newMax) => {
          setMax(newMax);
          onChange([min, newMax]);
        }}
      />
    </Container>
  );
};
