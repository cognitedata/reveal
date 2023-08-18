import { useState } from 'react';

import isUndefined from 'lodash/isUndefined';
import styled from 'styled-components/macro';

import { Chip } from '@cognite/cogs.js';

import { useTranslation } from '../../../../../hooks/useTranslation';
import { BaseFilterInput } from '../../../components';
import { NumericRange } from '../../../types';
import { FilterInputProps } from '../FilterInput';

const PLACEHOLDER = '...';

export type NumericRangeInputProps = FilterInputProps<NumericRange>;

export const NumericRangeInput: React.FC<NumericRangeInputProps> = ({
  value,
  onChange,
  ...rest
}) => {
  const { t } = useTranslation();

  const [min, setMin] = useState<number | undefined>(value?.[0]);
  const [max, setMax] = useState<number | undefined>(value?.[1]);

  return (
    <Container>
      <BaseFilterInput
        {...rest}
        type="number"
        placeholder={PLACEHOLDER}
        value={min}
        // helpText={dataMin && t('FILTER_INPUT_MIN', { value: dataMin })}
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

      <BaseFilterInput
        {...rest}
        type="number"
        placeholder={PLACEHOLDER}
        value={max}
        // helpText={dataMax && t('FILTER_INPUT_MAX', { value: dataMax })}
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

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;

  .cogs-input {
    width: 84.5px;
  }
`;
