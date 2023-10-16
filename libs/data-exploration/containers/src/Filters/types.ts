import { InputActionMeta } from 'react-select';

import { CheckboxSelectProps } from '@data-exploration/components';

import {
  InternalAssetFilters,
  InternalDocumentFilter,
  InternalEventsFilters,
  InternalFilesFilters,
  InternalSequenceFilters,
  InternalTimeseriesFilters,
} from '@data-exploration-lib/core';

export interface BaseFilter<TFilter> {
  // TODO: Investigate which properties are needed here to make dynamic filter work.
  // All the filter (e.g., SourceFilter, etc...) should manage the dynamic filter
  // themselves, meaning it takes in filter and network request to determine
  // what options to show and if the filter should be disabled
  filter?: TFilter;
  defaultFilter?: TFilter;
}

export interface CommonFilterProps {
  isError?: boolean;
  isLoading?: boolean;
  query?: string;
}

export interface BaseMultiSelectFilterProps<TFilter, TValue = string>
  extends BaseFilter<TFilter>,
    CommonFilterProps {
  value?: { label?: string; value: TValue }[];
  onChange?: (
    newSources: { label?: string; value: TValue }[] | undefined
  ) => void;
  onInputChange?: (newValue: string, actionMeta: InputActionMeta) => void;
  addNilOption?: boolean;
}

export interface BaseNestedFilterProps<TFilter>
  extends BaseFilter<TFilter>,
    CommonFilterProps {
  values?: { key: string; value: string }[];
  onChange?: (selection: { key: string; value: string }[]) => void;
  menuProps?: CheckboxSelectProps['menuProps'];
}

export interface MultiSelectOptionType<TValue> {
  label?: string;
  count?: number;
  value: TValue;
}
