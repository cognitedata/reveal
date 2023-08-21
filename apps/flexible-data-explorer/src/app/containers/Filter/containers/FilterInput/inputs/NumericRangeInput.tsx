import { useState } from 'react';

import isUndefined from 'lodash/isUndefined';
import styled from 'styled-components/macro';

import { Chip } from '@cognite/cogs.js';

import { useTranslation } from '../../../../../hooks/useTranslation';
import { useSearchAggregateValueByPropertyQuery } from '../../../../../services/instances/generic/queries/useInstanceSearchAggregatesQuery';
import { BaseFilterInput } from '../../../components';
import { NumericRange } from '../../../types';
import { FilterInputProps } from '../FilterInput';

const PLACEHOLDER = '...';

export type NumericRangeInputProps = FilterInputProps<NumericRange>;

export const NumericRangeInput: React.FC<NumericRangeInputProps> = ({
  dataType,
  field,
  value,
  onChange,
  ...rest
}) => {
  const { t } = useTranslation();

  const { data: dataMin, isLoading: isDataMinLoading } =
    useSearchAggregateValueByPropertyQuery<number>({
      dataType,
      field,
      property: 'min',
    });

  const { data: dataMax, isLoading: isDataMaxLoading } =
    useSearchAggregateValueByPropertyQuery<number>({
      dataType,
      field,
      property: 'max',
    });

  const [min, setMin] = useState<number | undefined>(value?.[0]);
  const [max, setMax] = useState<number | undefined>(value?.[1]);

  const isLoading = isDataMinLoading || isDataMaxLoading;

  return (
    <Container>
      <BaseFilterInput
        {...rest}
        type="number"
        placeholder={PLACEHOLDER}
        value={min}
        showSuggestions={false}
        helpText={
          !isUndefined(dataMin)
            ? t('FILTER_INPUT_MIN', { value: dataMin })
            : undefined
        }
        isLoading={isLoading}
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
        showSuggestions={false}
        helpText={
          !isUndefined(dataMax)
            ? t('FILTER_INPUT_MAX', { value: dataMax })
            : undefined
        }
        isLoading={isLoading}
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
