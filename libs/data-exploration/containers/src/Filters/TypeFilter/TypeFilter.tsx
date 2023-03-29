import {
  InternalDocumentFilter,
  InternalEventsFilters,
  useDeepMemo,
} from '@data-exploration-lib/core';
import {
  useDocumentAggregateFileTypeQuery,
  useEventsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter, MultiSelectOptionType } from '../types';
import { transformOptionsForMultiselectFilter } from '../utils';

interface BaseTypeFilterProps<TFilter> extends BaseFilter<TFilter> {
  value?: string | string[];
  onChange?: (type: string | string[]) => void;
  addNilOption?: boolean;
}

export interface TypeFilterProps<TFilter> extends BaseTypeFilterProps<TFilter> {
  options: MultiSelectOptionType<string>[];
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
      options={options}
      onChange={(_, type) => onChange?.(type.map((t) => t.value))}
      isMulti
    />
  );
}

const FileTypeFilter = (props: BaseTypeFilterProps<InternalDocumentFilter>) => {
  const { data: fileTypeItems = [] } = useDocumentAggregateFileTypeQuery();

  const options = useDeepMemo(
    () =>
      fileTypeItems.map((item) => ({
        label: String(item.value),
        value: String(item.value),
        count: item.count,
      })),
    [fileTypeItems]
  );

  return <TypeFilter {...props} options={options} title="File type" />;
};

const EventTypeFilter = (props: BaseTypeFilterProps<InternalEventsFilters>) => {
  const { data = [] } = useEventsUniqueValuesByProperty('type', props.filter);

  const options = useDeepMemo(
    () =>
      data.map((item) => ({
        label: String(item.value),
        value: String(item.value),
        count: item.count,
      })),
    [data]
  );

  return <TypeFilter {...props} options={options} />;
};

TypeFilter.Event = EventTypeFilter;
TypeFilter.File = FileTypeFilter;
