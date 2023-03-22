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
import { transformMetadataKeysToOptions } from './utils';

export interface MetadataFilterProps<TFilter>
  extends BaseNestedFilterProps<TFilter> {
  options: OptionType[];
  useCustomMetadataValuesQuery?: CustomMetadataValue;
}

export const MetadataFilter = <TFilter,>({
  options,
  useCustomMetadataValuesQuery,
  onChange,
}: MetadataFilterProps<TFilter>) => {
  return (
    <CheckboxSelect
      width="100%"
      options={options}
      onClickApply={(selection) => {
        onChange?.(selection);
      }}
      useCustomMetadataValuesQuery={useCustomMetadataValuesQuery}
    />
  );
};

const AssetsMetadataFilter = (
  props: BaseNestedFilterProps<InternalAssetFilters>
) => {
  const { data } = useAssetsMetadataKeysAggregateQuery(props.filter);
  const options = transformMetadataKeysToOptions(data);

  return (
    <MetadataFilter
      options={options}
      useCustomMetadataValuesQuery={useAssetsMetadataValuesOptionsQuery(
        props.filter
      )}
      {...props}
    />
  );
};

const EventsMetadataFilter = (
  props: BaseNestedFilterProps<InternalEventsFilters>
) => {
  const { data } = useEventsMetadataKeysAggregateQuery(props.filter);

  const options = transformMetadataKeysToOptions(data);

  return (
    <MetadataFilter
      options={options}
      useCustomMetadataValuesQuery={useEventsMetadataValuesOptionsQuery(
        props.filter
      )}
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
  const { data } = useDocumentsMetadataKeysAggregateQuery(props.filter);

  const options = transformMetadataKeysToOptions(data);

  return (
    <MetadataFilter
      options={options}
      useCustomMetadataValuesQuery={useDocumentMetadataValuesOptionsQuery(
        props.filter
      )}
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
