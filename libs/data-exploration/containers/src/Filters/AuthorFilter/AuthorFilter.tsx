import { InputActionMeta } from 'react-select';

import {
  DATA_EXPLORATION_COMPONENT,
  InternalDocumentFilter,
  useDebouncedState,
  useMetrics,
  useTranslation,
} from '@data-exploration-lib/core';
import { useDocumentsFilterOptions } from '@data-exploration-lib/domain-layer';

import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter, CommonFilterProps, MultiSelectOptionType } from '../types';
import { transformOptionsForMultiselectFilter } from '../utils';

interface BaseAuthorFilterProps<TFilter>
  extends BaseFilter<TFilter>,
    CommonFilterProps {
  value?: string[];
  onChange?: (type: string[]) => void;
  onInputChange?: (newValue: string, actionMeta: InputActionMeta) => void;
  addNilOption?: boolean;
  query?: string;
}

export interface AuthorFilterProps<TFilter>
  extends BaseAuthorFilterProps<TFilter> {
  options: MultiSelectOptionType<string>[];
  title?: string;
}

export function AuthorFilter<TFilter>({
  options,
  onChange,
  title,
  value,
  ...rest
}: AuthorFilterProps<TFilter>) {
  const { t } = useTranslation();
  const trackUsage = useMetrics();

  const handleChange = (
    authors: {
      label: string;
      value: string;
    }[]
  ) => {
    onChange?.(authors.map((author) => author.value));
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.AGGREGATE_FILTER, {
      value: authors,
      title,
    });
  };

  return (
    <MultiSelectFilter<string>
      {...rest}
      label={title || t('AUTHORS', 'Authors')}
      value={value ? transformOptionsForMultiselectFilter(value) : undefined}
      options={options}
      onChange={(_, authors) => handleChange(authors)}
      isMulti
    />
  );
}

const AuthorFilterFile = (
  props: BaseAuthorFilterProps<InternalDocumentFilter>
) => {
  const [query, setQuery] = useDebouncedState<string>();

  const { options, isLoading, isError } = useDocumentsFilterOptions({
    property: 'author',
    searchQuery: props.query,
    filter: props.filter,
    query,
  });

  return (
    <AuthorFilter
      {...props}
      onInputChange={setQuery}
      isError={isError}
      isLoading={isLoading}
      options={options}
    />
  );
};

AuthorFilter.File = AuthorFilterFile;
