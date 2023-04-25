import {
  DATA_EXPLORATION_COMPONENT,
  InternalAssetFilters,
  InternalDocumentFilter,
  InternalEventsFilters,
  InternalSequenceFilters,
  InternalTimeseriesFilters,
  useDebouncedState,
  useMetrics,
} from '@data-exploration-lib/core';
import {
  useAssetsMetadataFilterOptions,
  useAssetsMetadataValuesOptionsQuery,
  useDocumentMetadataValuesOptionsQuery,
  useEventsFilterOptionValues,
  useDocumentsMetadataFilterOptions,
  useEventsMetadataValuesOptionsQuery,
  useSequenceMetadataFilterOptions,
  useSequenceMetadataValuesOptionsQuery,
  useTimeseriesMetadataFilterOptions,
  useTimeseriesMetadataValuesOptionsQuery,
} from '@data-exploration-lib/domain-layer';
import {
  CheckboxSelect,
  OptionType,
  CustomMetadataValue,
  OptionSelection,
} from '@data-exploration/components';
import { BaseNestedFilterProps } from '../types';
import {
  transformMetadataSelectionChange,
  transformMetadataValues,
} from './utils';

export interface MetadataFilterProps<TFilter>
  extends BaseNestedFilterProps<TFilter> {
  values?: { key: string; value: string }[];
  options: OptionType[];
  onSearchInputChange?: (newValue: string) => void;
  useCustomMetadataValuesQuery?: CustomMetadataValue;
}

export const MetadataFilter = <TFilter,>({
  values,
  options,
  onSearchInputChange,
  useCustomMetadataValuesQuery,
  onChange,
  ...rest
}: MetadataFilterProps<TFilter>) => {
  const trackUsage = useMetrics();
  const selection = transformMetadataValues(values);

  const handleOnClickApply = (newSelection: OptionSelection) => {
    const transformedSelection = transformMetadataSelectionChange(newSelection);

    onChange?.(transformedSelection);

    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.METADATA_FILTER, values);
  };

  return (
    <CheckboxSelect
      {...rest}
      width="100%"
      selection={selection}
      label="Metadata"
      options={options}
      onSearchInputChange={onSearchInputChange}
      onClickApply={handleOnClickApply}
      useCustomMetadataValuesQuery={useCustomMetadataValuesQuery}
    />
  );
};

const AssetsMetadataFilter = (
  props: BaseNestedFilterProps<InternalAssetFilters>
) => {
  const [query, setQuery] = useDebouncedState<string>();

  const { options, isLoading, isError } = useAssetsMetadataFilterOptions({
    query,
    searchQuery: props.query,
    filter: props.filter,
  });

  return (
    <MetadataFilter
      options={options}
      onSearchInputChange={setQuery}
      isError={isError}
      isLoading={isLoading}
      useCustomMetadataValuesQuery={useAssetsMetadataValuesOptionsQuery({
        searchQuery: props.query,
        filter: props.filter,
      })}
      {...props}
    />
  );
};

const EventsMetadataFilter = (
  props: BaseNestedFilterProps<InternalEventsFilters>
) => {
  const [query, setQuery] = useDebouncedState<string>();

  const { options, isLoading, isError } = useEventsFilterOptionValues({
    query,
    searchQuery: props.query,
    filter: props.filter,
  });

  return (
    <MetadataFilter
      options={options}
      onSearchInputChange={setQuery}
      isError={isError}
      isLoading={isLoading}
      useCustomMetadataValuesQuery={useEventsMetadataValuesOptionsQuery({
        searchQuery: props.query,
        filter: props.filter,
      })}
      {...props}
    />
  );
};

const TimeseriesMetadataFilter = (
  props: BaseNestedFilterProps<InternalTimeseriesFilters>
) => {
  const [query, setQuery] = useDebouncedState<string>();

  const { options, isLoading, isError } = useTimeseriesMetadataFilterOptions({
    query,
    filter: props.filter,
    searchQuery: props.query,
  });

  return (
    <MetadataFilter
      options={options}
      onSearchInputChange={setQuery}
      useCustomMetadataValuesQuery={useTimeseriesMetadataValuesOptionsQuery({
        filter: props.filter,
        searchQuery: props.query,
      })}
      isError={isError}
      isLoading={isLoading}
      {...props}
    />
  );
};

const FilesMetadataFilter = (
  props: BaseNestedFilterProps<InternalDocumentFilter>
) => {
  const [query, setQuery] = useDebouncedState<string>();

  const { options, isLoading, isError } = useDocumentsMetadataFilterOptions({
    query,
    searchQuery: props.query,
    filter: props.filter,
  });

  return (
    <MetadataFilter
      options={options}
      onSearchInputChange={setQuery}
      isError={isError}
      isLoading={isLoading}
      useCustomMetadataValuesQuery={useDocumentMetadataValuesOptionsQuery({
        searchQuery: props.query,
        filter: props.filter,
      })}
      {...props}
    />
  );
};

const SequencesMetadataFilter = (
  props: BaseNestedFilterProps<InternalSequenceFilters>
) => {
  const [query, setQuery] = useDebouncedState<string>();

  const { options, isLoading, isError } = useSequenceMetadataFilterOptions({
    query,
    filter: props.filter,
    searchQuery: props.query,
  });

  return (
    <MetadataFilter
      options={options}
      onSearchInputChange={setQuery}
      useCustomMetadataValuesQuery={useSequenceMetadataValuesOptionsQuery({
        filter: props.filter,
        searchQuery: props.query,
      })}
      isError={isError}
      isLoading={isLoading}
      {...props}
    />
  );
};

MetadataFilter.Assets = AssetsMetadataFilter;
MetadataFilter.Events = EventsMetadataFilter;
MetadataFilter.Timeseries = TimeseriesMetadataFilter;
MetadataFilter.Files = FilesMetadataFilter;
MetadataFilter.Sequences = SequencesMetadataFilter;
