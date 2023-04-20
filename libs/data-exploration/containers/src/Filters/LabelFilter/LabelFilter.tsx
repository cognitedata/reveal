import {
  useAssetsFilterOptions,
  useDocumentsLabelsFilterOptions,
} from '@data-exploration-lib/domain-layer';
import { BaseMultiSelectFilterProps, MultiSelectOptionType } from '../types';
import { MultiSelectFilter } from '../MultiSelectFilter';
import {
  DATA_EXPLORATION_COMPONENT,
  InternalAssetFilters,
  InternalDocumentFilter,
  useDebouncedState,
  useMetrics,
} from '@data-exploration-lib/core';

interface Props<TFilter> extends BaseMultiSelectFilterProps<TFilter> {
  options: MultiSelectOptionType<string>[];
}

export const LabelFilter = <TFilter,>({
  options,
  onChange,
  value,
  addNilOption,
  onInputChange,
  isError,
  isLoading,
}: Props<TFilter>) => {
  const trackUsage = useMetrics();

  const handleChange = (
    newValue: {
      label: string;
      value: string;
    }[]
  ) => {
    const newFilters = newValue && newValue.length > 0 ? newValue : undefined;
    onChange?.(newFilters);
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.AGGREGATE_FILTER, {
      value: newFilters,
      title: 'Label Filter',
    });
  };

  return (
    <MultiSelectFilter<string>
      label="Labels"
      isLoading={isLoading}
      isError={isError}
      options={options}
      onChange={(_, newValue) => handleChange(newValue)}
      onInputChange={onInputChange}
      value={value}
      isMulti
      isSearchable
      isClearable
      addNilOption={addNilOption}
    />
  );
};

const AssetLabelFilter = (
  props: BaseMultiSelectFilterProps<InternalAssetFilters>
) => {
  const [prefix, setPrefix] = useDebouncedState<string>();

  const { options, isLoading, isError } = useAssetsFilterOptions({
    property: 'labels',
    query: props.query,
    filter: props.filter,
    prefix,
  });

  return (
    <LabelFilter
      {...props}
      onInputChange={setPrefix}
      isError={isError}
      isLoading={isLoading}
      options={options}
    />
  );
};

export const DocumentLabelFilter = (
  props: BaseMultiSelectFilterProps<InternalDocumentFilter>
) => {
  const [prefix, setPrefix] = useDebouncedState<string>();

  const { options, isLoading, isError } = useDocumentsLabelsFilterOptions({
    query: props.query,
    filter: props.filter,
    prefix,
  });

  return (
    <LabelFilter
      {...props}
      onInputChange={setPrefix}
      options={options}
      isError={isError}
      isLoading={isLoading}
    />
  );
};

LabelFilter.Asset = AssetLabelFilter;
LabelFilter.File = DocumentLabelFilter;
