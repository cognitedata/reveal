import { InputActionMeta } from 'react-select';

import { CheckboxSelectProps } from '@data-exploration/components';

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

export type MultiSelectFilterValue<TValue> = {
  label?: string;
  value: TValue;
}[];

export interface BaseMultiSelectFilterProps<TFilter, TValue = string>
  extends BaseFilter<TFilter>,
    CommonFilterProps {
  value?: MultiSelectFilterValue<TValue>;
  onChange?: (newValue?: MultiSelectFilterValue<TValue>) => void;
  onInputChange?: (newValue: string, actionMeta: InputActionMeta) => void;
  addNilOption?: boolean;
  menuPortalTarget?: HTMLElement;
}

export interface BaseNestedFilterProps<TFilter>
  extends BaseFilter<TFilter>,
    CommonFilterProps {
  values?: { key: string; value: string }[];
  onChange?: (selection: { key: string; value: string }[]) => void;
  menuProps?: CheckboxSelectProps['menuProps'];
  menuPortalTarget?: HTMLElement;
}

export interface MultiSelectOptionType<TValue> {
  label?: string;
  count?: number;
  value: TValue;
}

export enum AssetFilterType {
  AllLinked = 'LINKED',
  DirectlyLinked = 'DIRECTLY_LINKED',
}
