import {
  InternalAssetFilters,
  InternalDocumentFilter,
  InternalEventsFilters,
  InternalSequenceFilters,
  InternalTimeseriesFilters,
} from '@data-exploration-lib/core';
import {
  useAssetsMetadataKeysAggregateQuery,
  useAssetsMetadataValuesOptionsQuery,
  useDocumentMetadataValuesOptionsQuery,
  useDocumentsMetadataKeysAggregateQuery,
  useEventsMetadataKeysAggregateQuery,
  useEventsMetadataValuesOptionsQuery,
  useSequenceMetadataValuesOptionsQuery,
  useSequencesMetadataKeysAggregateQuery,
  useTimeseriesMetadataKeysAggregateQuery,
  useTimeseriesMetadataValuesOptionsQuery,
} from '@data-exploration-lib/domain-layer';
import {
  CheckboxSelect,
  OptionType,
  CustomMetadataValue,
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
  useCustomMetadataValuesQuery?: CustomMetadataValue;
}

export const MetadataFilter = <TFilter,>({
  values,
  options,
  useCustomMetadataValuesQuery,
  onChange,
}: MetadataFilterProps<TFilter>) => {
  const selection = transformMetadataValues(values);

  return (
    <CheckboxSelect
      width="100%"
      selection={selection}
      label="Metadata"
      options={options}
      onClickApply={(newSelection) => {
        const transformedSelection =
          transformMetadataSelectionChange(newSelection);

        onChange?.(transformedSelection);
      }}
      useCustomMetadataValuesQuery={useCustomMetadataValuesQuery}
    />
  );
};

const AssetsMetadataFilter = (
  props: BaseNestedFilterProps<InternalAssetFilters>
) => {
  const { data } = useAssetsMetadataKeysAggregateQuery();
  const options = transformMetadataKeysToOptions(data);

  return (
    <MetadataFilter
      options={options}
      useCustomMetadataValuesQuery={useAssetsMetadataValuesOptionsQuery()}
      {...props}
    />
  );
};

const EventsMetadataFilter = (
  props: BaseNestedFilterProps<InternalEventsFilters>
) => {
  const { data } = useEventsMetadataKeysAggregateQuery();

  const options = transformMetadataKeysToOptions(data);

  return (
    <MetadataFilter
      options={options}
      useCustomMetadataValuesQuery={useEventsMetadataValuesOptionsQuery()}
      {...props}
    />
  );
};

const TimeseriesMetadataFilter = (
  props: BaseNestedFilterProps<InternalTimeseriesFilters>
) => {
  const { data } = useTimeseriesMetadataKeysAggregateQuery(props.filter);

  const options = transformMetadataKeysToOptions(data);

  return (
    <MetadataFilter
      options={options}
      useCustomMetadataValuesQuery={useTimeseriesMetadataValuesOptionsQuery(
        props.filter
      )}
      {...props}
    />
  );
};

const FilesMetadataFilter = (
  props: BaseNestedFilterProps<InternalDocumentFilter>
) => {
  const { data } = useDocumentsMetadataKeysAggregateQuery();

  const options = transformMetadataKeysToOptions(data);

  return (
    <MetadataFilter
      options={options}
      useCustomMetadataValuesQuery={useDocumentMetadataValuesOptionsQuery()}
      {...props}
    />
  );
};

const SequencesMetadataFilter = (
  props: BaseNestedFilterProps<InternalSequenceFilters>
) => {
  const { data } = useSequencesMetadataKeysAggregateQuery(props.filter);

  const options = transformMetadataKeysToOptions(data);

  return (
    <MetadataFilter
      options={options}
      useCustomMetadataValuesQuery={useSequenceMetadataValuesOptionsQuery(
        props.filter
      )}
      {...props}
    />
  );
};

MetadataFilter.Assets = AssetsMetadataFilter;
MetadataFilter.Events = EventsMetadataFilter;
MetadataFilter.Timeseries = TimeseriesMetadataFilter;
MetadataFilter.Files = FilesMetadataFilter;
MetadataFilter.Sequences = SequencesMetadataFilter;
