export interface BaseFilter<TFilter> {
  // TODO: Investigate which properties are needed here to make dynamic filter work.
  // All the filter (e.g., SourceFilter, etc...) should manage the dynamic filter
  // themselves, meaning it takes in filter and network request to determine
  // what options to show and if the filter should be disabled
  filter?: TFilter;
}

export interface BaseMultiSelectFilterProps<TFilter, TValue = string>
  extends BaseFilter<TFilter> {
  value?: { label?: string; value: TValue }[];
  onChange?: (
    newSources: { label?: string; value: TValue }[] | undefined
  ) => void;
  addNilOption?: boolean;
  error?: boolean;
  loading?: boolean;
}
