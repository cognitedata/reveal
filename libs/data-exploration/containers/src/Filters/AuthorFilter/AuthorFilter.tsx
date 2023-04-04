import {
  InternalDocumentFilter,
  useDebouncedState,
  useDeepMemo,
} from '@data-exploration-lib/core';
import { useDocumentsUniqueValuesByProperty } from '@data-exploration-lib/domain-layer';
import { InputActionMeta } from 'react-select';
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
  title = 'Author',
  value,
  ...rest
}: AuthorFilterProps<TFilter>) {
  return (
    <MultiSelectFilter<string>
      {...rest}
      label={title}
      value={value ? transformOptionsForMultiselectFilter(value) : undefined}
      options={options}
      onChange={(_, authors) =>
        onChange?.(authors.map((author) => author.value))
      }
      isMulti
    />
  );
}

const AuthorFilterFile = (
  props: BaseAuthorFilterProps<InternalDocumentFilter>
) => {
  const [query, setQuery] = useDebouncedState<string | undefined>(undefined);

  const {
    data = [],
    isLoading,
    isError,
  } = useDocumentsUniqueValuesByProperty('author', query, {
    keepPreviousData: true,
  });

  const options = useDeepMemo(
    () =>
      data.map((item) => ({
        label: String(item.value),
        value: String(item.value),
        count: item.count,
      })),
    [data]
  );
  return (
    <AuthorFilter
      {...props}
      onInputChange={(newValue) => setQuery(newValue)}
      isError={isError}
      isLoading={isLoading}
      options={options}
    />
  );
};

AuthorFilter.File = AuthorFilterFile;
