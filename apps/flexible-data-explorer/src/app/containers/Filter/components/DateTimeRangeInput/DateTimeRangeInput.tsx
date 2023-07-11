import * as React from 'react';
import { useState } from 'react';

import isUndefined from 'lodash/isUndefined';

import { useTranslation } from '../../../../hooks/useTranslation';
import { DateRange, InputControlProps } from '../../types';
import { DateTimeInput } from '../DateTimeInput';

import { Chip, Container } from './elements';

export type DateTimeRangeInputProps = InputControlProps<DateRange>;

export const DateTimeRangeInput: React.FC<DateTimeRangeInputProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation();

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

      <Chip>{t('FILTER_AND_OPERATION')}</Chip>

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
