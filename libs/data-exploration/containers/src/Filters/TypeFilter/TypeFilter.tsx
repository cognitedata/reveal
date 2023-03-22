import {
  InternalDocumentFilter,
  InternalEventsFilters,
} from '@data-exploration-lib/core';
import {
  useDocumentAggregateFileTypeQuery,
  useEventsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter } from '../types';
import { transformOptionsForMultiselectFilter } from '../utils';

interface BaseTypeFilterProps<TFilter> extends BaseFilter<TFilter> {
  value?: string | string[];
  onChange?: (type: string | string[]) => void;
  addNilOption?: boolean;
}

export interface TypeFilterProps<TFilter> extends BaseTypeFilterProps<TFilter> {
  options: string | string[];
  title?: string;
}

export function TypeFilter<TFilter>({
  options,
  onChange,
  title = 'Type',
  value,
  ...rest
}: TypeFilterProps<TFilter>) {
  return (
    <MultiSelectFilter<string>
      {...rest}
      label={title}
      value={value ? transformOptionsForMultiselectFilter(value) : undefined}
      options={transformOptionsForMultiselectFilter(options)}
      onChange={(_, type) => onChange?.(type.map((t) => t.value))}
      isMulti
    />
  );
}

const FileTypeFilter = (props: BaseTypeFilterProps<InternalDocumentFilter>) => {
  const { data: fileTypeItems } = useDocumentAggregateFileTypeQuery();
  const options = fileTypeItems.map((item) => `${item.value}`);
  return <TypeFilter {...props} options={options} title="File type" />;
};

const EventTypeFilter = (props: BaseTypeFilterProps<InternalEventsFilters>) => {
  const { data = [] } = useEventsUniqueValuesByProperty('type', props.filter);
  const options = data.map((item) => `${item.value}`);

  return <TypeFilter {...props} options={options} />;
};

TypeFilter.Event = EventTypeFilter;
TypeFilter.File = FileTypeFilter;
