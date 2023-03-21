import { OptionType, Tooltip } from '@cognite/cogs.js';
import {
  InternalAssetFilters,
  useAssetsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';
import { BaseMultiSelectFilterProps } from '../types';
import { MultiSelectFilter } from '../MultiSelectFilter';

interface Props<TFilter> extends BaseMultiSelectFilterProps<TFilter> {
  options: OptionType<string>[];
}

export const LabelFilter = <TFilter,>({
  options,
  onChange,
  value,
  addNilOption,
  error,
  loading,
}: Props<TFilter>) => {
  const handleChange = (newValue: OptionType<string>[]) => {
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
  const {
    data: labels = [],
    isLoading,
    isError,
  } = useAssetsUniqueValuesByProperty('labels');

  const options = labels.map((label) => ({
    label: String(label.value),
    value: String(label.value),
  }));

  return (
    <LabelFilter
      {...props}
      error={isError}
      loading={isLoading}
      options={options}
    />
  );
};

LabelFilter.Asset = AssetLabelFilter;
