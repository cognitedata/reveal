import { useTranslation } from '../../../../../hooks/useTranslation';
import { useSearchAggregateValuesQuery } from '../../../../../services/instances/generic/queries/useInstanceSearchAggregatesQuery';
import { BaseFilterInput } from '../../../components';
import { FilterInputProps } from '../FilterInput';
import { useDeboucedValue } from '../useDeboucedValue';

export type StringInputProps = FilterInputProps<string>;

export const StringInput: React.FC<StringInputProps> = ({
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
      value={value}
      type="text"
      placeholder={t('FILTER_TEXT_INPUT_PLACEHOLDER')}
      suggestions={suggestions}
      isLoading={isSuggestionsLoading}
    />
  );
};
