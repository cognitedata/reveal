import { OptionType } from '@cognite/cogs.js';
import {
  InternalDocumentFilter,
  InternalEventsFilters,
  useDocumentAggregateFileTypeQuery,
  useEventsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter } from '../types';

interface BaseTypeFilterProps<TFilter> extends BaseFilter<TFilter> {
  value?: OptionType<string>[];
  onChange?: (type: OptionType<string>[]) => void;
  addNilOption?: boolean;
}

export interface TypeFilterProps<TFilter> extends BaseTypeFilterProps<TFilter> {
  options: OptionType<string>[];
  title?: string;
}

export function TypeFilter<TFilter>({
  options,
  onChange,
  title = 'Type',

  ...rest
}: TypeFilterProps<TFilter>) {
  return (
    <MultiSelectFilter<string>
      {...rest}
      label={title}
      options={options}
      onChange={(_, type) => onChange?.(type)}
    />
  );
}

const FileTypeFilter = (props: BaseTypeFilterProps<InternalDocumentFilter>) => {
  const { data: fileTypeItems } = useDocumentAggregateFileTypeQuery();
  const options = fileTypeItems.map((item) => ({
    label: `${item.value}`,
    value: `${item.value}`,
  }));
  return <TypeFilter {...props} options={options} title="File type" />;
};

const EventTypeFilter = (props: BaseTypeFilterProps<InternalEventsFilters>) => {
  const { data = [] } = useEventsUniqueValuesByProperty('type', props.filter);
  const options = data.map((item) => ({
    label: `${item.value}`,
    value: `${item.value}`,
  }));

  return <TypeFilter {...props} options={options} />;
};

TypeFilter.Event = EventTypeFilter;
TypeFilter.File = FileTypeFilter;
