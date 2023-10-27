import { useState } from 'react';

import { useSearchAggregateValuesQuery } from '@fdx/services/instances/generic/queries/useInstanceSearchAggregatesQuery';
import { useTranslation } from '@fdx/shared/hooks/useTranslation';

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
      data-testid="string-input"
      value={value}
      type="text"
      placeholder={t('FILTER_TEXT_INPUT_PLACEHOLDER')}
      suggestions={suggestions}
      isLoading={isSuggestionsLoading}
      onInputChange={setInputValue}
    />
  );
};
