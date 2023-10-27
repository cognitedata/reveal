import { useState } from 'react';

import { useSearchAggregateValueByPropertyQuery } from '@fdx/services/instances/generic/queries/useInstanceSearchAggregatesQuery';
import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import { NumericRange } from '@fdx/shared/types/filters';
import isUndefined from 'lodash/isUndefined';
import styled from 'styled-components/macro';

import { BaseFilterInput, TextChip } from '../../../components';
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
      <BaseFilterInput.Single
        {...rest}
        data-testid="number-input-min"
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

      <TextChip>{t('FILTER_AND_OPERATION')}</TextChip>

      <BaseFilterInput.Single
        {...rest}
        data-testid="number-input-max"
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
