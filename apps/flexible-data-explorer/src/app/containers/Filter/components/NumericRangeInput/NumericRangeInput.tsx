import * as React from 'react';
import { useMemo, useState } from 'react';

import isUndefined from 'lodash/isUndefined';
import lodashMax from 'lodash/max';
import lodashMin from 'lodash/min';

import { Chip } from '@cognite/cogs.js';

import { useTranslation } from '../../../../hooks/useTranslation';
import { BaseInputProps, NumericRange } from '../../types';
import { NumberInput } from '../NumberInput';

import { Container } from './elements';

const PLACEHOLDER = '...';

export type NumericRangeInputProps = BaseInputProps<NumericRange>;

export const NumericRangeInput: React.FC<NumericRangeInputProps> = ({
  value,
  onChange,
  suggestions = [],
}) => {
  const { t } = useTranslation();

  const [min, setMin] = useState<number | undefined>(value?.[0]);
  const [max, setMax] = useState<number | undefined>(value?.[1]);

  const [dataMin, dataMax] = useMemo(() => {
    return [lodashMin(suggestions), lodashMax(suggestions)];
  }, [suggestions]);

  return (
    <Container>
      <NumberInput
        placeholder={PLACEHOLDER}
        value={min}
        helpText={dataMin && t('FILTER_INPUT_MIN', { value: dataMin })}
        onChange={(newMin) => {
          setMin(newMin);

          if (!isUndefined(newMin) && !isUndefined(max)) {
            onChange([newMin, max]);
          }
        }}
      />

      <Chip
        label={t('FILTER_AND_OPERATION')}
        tooltipProps={{ disabled: true }}
      />

      <NumberInput
        placeholder={PLACEHOLDER}
        value={max}
        helpText={dataMax && t('FILTER_INPUT_MAX', { value: dataMax })}
        onChange={(newMax) => {
          setMax(newMax);

          if (!isUndefined(min) && !isUndefined(newMax)) {
            onChange([min, newMax]);
          }
        }}
      />
    </Container>
  );
};
