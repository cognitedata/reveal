import {
  useAssetsUniqueValuesByProperty,
  useDocumentsLabelAggregateQuery,
} from '@data-exploration-lib/domain-layer';
import { BaseMultiSelectFilterProps, MultiSelectOptionType } from '../types';
import { MultiSelectFilter } from '../MultiSelectFilter';
import {
  DATA_EXPLORATION_COMPONENT,
  InternalAssetFilters,
  InternalDocumentFilter,
  useDeepMemo,
  useMetrics,
} from '@data-exploration-lib/core';
import { useState } from 'react';

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
  const [query, setQuery] = useState<string | undefined>(undefined);

  const {
    data: labels = [],
    isLoading,
    isError,
  } = useAssetsUniqueValuesByProperty('labels', query);

  const options = useDeepMemo(
    () =>
      labels.map((label) => ({
        label: String(label.value),
        value: String(label.value),
        count: label.count,
      })),
    [labels]
  );

  return (
    <LabelFilter
      {...props}
      onInputChange={(value) => setQuery(value)}
      isError={isError}
      isLoading={isLoading}
      options={options}
    />
  );
};

export const DocumentLabelFilter = (
  props: BaseMultiSelectFilterProps<InternalDocumentFilter>
) => {
  const { data: labels, isLoading } = useDocumentsLabelAggregateQuery();

  const options = (labels || []).map((item) => ({
    label: `${item.value}`,
    value: `${item.value}`,
    count: item.count,
  }));

  return <LabelFilter {...props} options={options} isLoading={isLoading} />;
};

LabelFilter.Asset = AssetLabelFilter;
LabelFilter.File = DocumentLabelFilter;
