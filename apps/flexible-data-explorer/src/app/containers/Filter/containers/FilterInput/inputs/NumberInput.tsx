import { useTranslation } from '../../../../../hooks/useTranslation';
import { useSearchAggregateValuesQuery } from '../../../../../services/dataTypes/queries/useSearchAggregatesQuery';
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

export const NumberInputLessThan: React.FC<NumberInputProps> = (props) => {
  // const { t } = useTranslation();

  return (
    <BaseFilterInput
      {...props}
      type="number"
      // helpText={t('FILTER_INPUT_MIN', { value: 0 })}
      showSuggestions={false}
    />
  );
};

export const NumberInputGreaterThan: React.FC<NumberInputProps> = (props) => {
  // const { t } = useTranslation();

  return (
    <BaseFilterInput
      {...props}
      type="number"
      // helpText={t('FILTER_INPUT_MAX', { value: 0 })}
      showSuggestions={false}
    />
  );
};
