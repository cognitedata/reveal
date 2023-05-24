import * as React from 'react';
import { useState } from 'react';

import { Chip } from '@cognite/cogs.js';

import isUndefined from 'lodash/isUndefined';

import { NumberInput } from '../NumberInput';

import { InputControlProps } from '../../types';
import { Container } from './elements';

const PLACEHOLDER = '...';

export type NumericRangeInputProps = InputControlProps<'numeric-range'>;

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

          if (!isUndefined(max)) {
            onChange([newMin, max]);
          }
        }}
      />

      <Chip label="AND" />

      <NumberInput
        placeholder={PLACEHOLDER}
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
