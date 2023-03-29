import { Tooltip } from '@cognite/cogs.js';
import {
  useAssetsUniqueValuesByProperty,
  useDocumentsLabelAggregateQuery,
} from '@data-exploration-lib/domain-layer';
import { BaseMultiSelectFilterProps, MultiSelectOptionType } from '../types';
import { MultiSelectFilter } from '../MultiSelectFilter';
import {
  InternalAssetFilters,
  InternalDocumentFilter,
  useDeepMemo,
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
  error,
  loading,
}: Props<TFilter>) => {
  const handleChange = (
    newValue: {
      label: string;
      value: string;
    }[]
  ) => {
    const newFilters = newValue && newValue.length > 0 ? newValue : undefined;
    onChange?.(newFilters);
  };

  if (loading) {
    return null;
  }

  return (
    <Tooltip
      interactive
      disabled={!error}
      content="Error fetching labels, please make sure you have labelsAcl:READ"
    >
      <>
        <MultiSelectFilter<string>
          label="Labels"
          options={options}
          onChange={(_, newValue) => handleChange(newValue)}
          value={value}
          onInputChange={onInputChange}
          isMulti
          isSearchable
          isClearable
          addNilOption={addNilOption}
        />
      </>
    </Tooltip>
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
      error={isError}
      loading={isLoading}
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
  }));

  return <LabelFilter {...props} options={options} loading={isLoading} />;
};

LabelFilter.Asset = AssetLabelFilter;
LabelFilter.File = DocumentLabelFilter;
