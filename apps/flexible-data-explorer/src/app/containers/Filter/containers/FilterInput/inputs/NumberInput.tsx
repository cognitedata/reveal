import isUndefined from 'lodash/isUndefined';

import { useTranslation } from '../../../../../hooks/useTranslation';
import {
  useSearchAggregateValueByPropertyQuery,
  useSearchAggregateValuesQuery,
} from '../../../../../services/instances/generic/queries/useInstanceSearchAggregatesQuery';
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
  const { t } = useTranslation();

  const query = useDeboucedValue(value);

  const { data: suggestions = [], isLoading: isSuggestionsLoading } =
    useSearchAggregateValuesQuery({
      dataType,
      field,
      query,
    });

  return (
    <BaseFilterInput
      {...rest}
      type="number"
      value={value}
      placeholder={t('FILTER_NUMBER_INPUT_PLACEHOLDER')}
      suggestions={suggestions}
      isLoading={isSuggestionsLoading}
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
    <BaseFilterInput
      {...rest}
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
    <BaseFilterInput
      {...rest}
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
