import { useState } from 'react';

import {
  useSearchAggregateValueByPropertyQuery,
  useSearchAggregateValuesQuery,
} from '@fdx/services/instances/generic/queries/useInstanceSearchAggregatesQuery';
import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import isUndefined from 'lodash/isUndefined';

import { BaseFilterInput } from '../../../components';
import { FilterInputProps } from '../FilterInput';
import { useDeboucedValue } from '../useDeboucedValue';

export type NumberInputProps = FilterInputProps<number>;

export const NumberInput: React.FC<NumberInputProps> = ({
  dataType,
  field,
  value,
  ...rest
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  const { t } = useTranslation();
  const query = useDeboucedValue(inputValue);

  const { data: suggestions = [], isLoading: isSuggestionsLoading } =
    useSearchAggregateValuesQuery({
      dataType,
      field,
      query,
    });

  return (
    <BaseFilterInput.Single
      {...rest}
      data-testid="number-input"
      type="number"
      value={value}
      placeholder={t('FILTER_NUMBER_INPUT_PLACEHOLDER')}
      suggestions={suggestions}
      isLoading={isSuggestionsLoading}
      onInputChange={setInputValue}
    />
  );
};

export const NumberInputLessThan: React.FC<NumberInputProps> = ({
  dataType,
  field,
  ...rest
}) => {
  const { t } = useTranslation();

  const { data: min, isLoading: isMinLoading } =
    useSearchAggregateValueByPropertyQuery<number>({
      dataType,
      field,
      property: 'min',
    });

  return (
    <BaseFilterInput.Single
      {...rest}
      data-testid="number-input"
      type="number"
      placeholder={t('FILTER_NUMBER_INPUT_PLACEHOLDER')}
      showSuggestions={false}
      helpText={
        !isUndefined(min) ? t('FILTER_INPUT_MIN', { value: min }) : undefined
      }
      isLoading={isMinLoading}
    />
  );
};

export const NumberInputGreaterThan: React.FC<NumberInputProps> = ({
  dataType,
  field,
  ...rest
}) => {
  const { t } = useTranslation();

  const { data: max, isLoading: isMaxLoading } =
    useSearchAggregateValueByPropertyQuery<number>({
      dataType,
      field,
      property: 'max',
    });

  return (
    <BaseFilterInput.Single
      {...rest}
      data-testid="number-input"
      type="number"
      placeholder={t('FILTER_NUMBER_INPUT_PLACEHOLDER')}
      showSuggestions={false}
      helpText={
        !isUndefined(max) ? t('FILTER_INPUT_MAX', { value: max }) : undefined
      }
      isLoading={isMaxLoading}
    />
  );
};
