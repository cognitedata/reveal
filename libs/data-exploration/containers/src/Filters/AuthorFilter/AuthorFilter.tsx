import { InternalDocumentFilter } from '@data-exploration-lib/core';
import { useDocumentAggregateAuthorQuery } from '@data-exploration-lib/domain-layer';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter } from '../types';
import { transformOptionsForMultiselectFilter } from '../utils';

interface BaseAuthorFilterProps<TFilter> extends BaseFilter<TFilter> {
  value?: string[];
  onChange?: (type: string[]) => void;
  addNilOption?: boolean;
}

export interface AuthorFilterProps<TFilter>
  extends BaseAuthorFilterProps<TFilter> {
  options: string[];
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
      options={transformOptionsForMultiselectFilter(options)}
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
  const { data: fileTypeItems } = useDocumentAggregateAuthorQuery();
  const options = fileTypeItems.map((item) => `${item.value}`);
  return <AuthorFilter {...props} options={options} />;
};

AuthorFilter.File = AuthorFilterFile;
