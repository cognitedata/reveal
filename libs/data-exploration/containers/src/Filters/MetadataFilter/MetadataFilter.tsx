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
  useDocumentsMetadataFilterOptions,
  useEventsMetadataKeysAggregateQuery,
  useEventsMetadataValuesOptionsQuery,
  useSequenceMetadataFilterOptions,
  useSequenceMetadataValuesOptionsQuery,
  useTimeseriesMetadataKeysAggregateQuery,
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
  transformMetadataKeysToOptions,
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
  const [prefix, setPrefix] = useDebouncedState<string>();

  const { options, isLoading, isError } = useAssetsMetadataFilterOptions({
    prefix,
    query: props.query,
    filter: props.filter,
  });

  return (
    <MetadataFilter
      options={options}
      onSearchInputChange={setPrefix}
      isError={isError}
      isLoading={isLoading}
      useCustomMetadataValuesQuery={useAssetsMetadataValuesOptionsQuery({
        query: props.query,
        filter: props.filter,
      })}
      {...props}
    />
  );
};

const EventsMetadataFilter = (
  props: BaseNestedFilterProps<InternalEventsFilters>
) => {
  const [query, setQuery] = useDebouncedState<string | undefined>(undefined);

  const { data, isLoading, isError } = useEventsMetadataKeysAggregateQuery(
    query,
    undefined,
    { keepPreviousData: true }
  );

  const options = transformMetadataKeysToOptions(data);

  return (
    <MetadataFilter
      options={options}
      onSearchInputChange={(newValue) => setQuery(newValue)}
      isError={isError}
      isLoading={isLoading}
      useCustomMetadataValuesQuery={useEventsMetadataValuesOptionsQuery()}
      {...props}
    />
  );
};

const TimeseriesMetadataFilter = (
  props: BaseNestedFilterProps<InternalTimeseriesFilters>
) => {
  const [query, setQuery] = useDebouncedState<string | undefined>(undefined);

  const { data, isLoading, isError } = useTimeseriesMetadataKeysAggregateQuery(
    query,
    undefined,
    { keepPreviousData: true }
  );

  const options = transformMetadataKeysToOptions(data);

  return (
    <MetadataFilter
      options={options}
      onSearchInputChange={(newValue) => setQuery(newValue)}
      useCustomMetadataValuesQuery={useTimeseriesMetadataValuesOptionsQuery()}
      isError={isError}
      isLoading={isLoading}
      {...props}
    />
  );
};

const FilesMetadataFilter = (
  props: BaseNestedFilterProps<InternalDocumentFilter>
) => {
  const [prefix, setPrefix] = useDebouncedState<string>();

  const { options, isLoading, isError } = useDocumentsMetadataFilterOptions({
    prefix,
    query: props.query,
    filter: props.filter,
  });

  return (
    <MetadataFilter
      options={options}
      onSearchInputChange={setPrefix}
      isError={isError}
      isLoading={isLoading}
      useCustomMetadataValuesQuery={useDocumentMetadataValuesOptionsQuery({
        query: props.query,
        filter: props.filter,
      })}
      {...props}
    />
  );
};

const SequencesMetadataFilter = (
  props: BaseNestedFilterProps<InternalSequenceFilters>
) => {
  const [prefix, setPrefix] = useDebouncedState<string>();

  const { options, isLoading, isError } = useSequenceMetadataFilterOptions({
    prefix,
    filter: props.filter,
    query: props.query,
  });

  return (
    <MetadataFilter
      options={options}
      onSearchInputChange={setPrefix}
      useCustomMetadataValuesQuery={useSequenceMetadataValuesOptionsQuery({
        filter: props.filter,
        query: props.query,
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
