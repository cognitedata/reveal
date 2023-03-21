import { OptionType, Tooltip } from '@cognite/cogs.js';
import {
  DataSetInternal,
  DataSetWithCount,
  useDatasetsListQuery,
} from '@data-exploration-lib/domain-layer';
import { BaseMultiSelectFilterProps } from '../types';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { ResourceType } from '@data-exploration-lib/core';

interface DataSetFilterProps<TFilter>
  extends BaseMultiSelectFilterProps<TFilter, number> {
  options: OptionType<number>[];
  resourceType?: ResourceType;
}

export const DataSetFilter = <TFilter,>({
  options,
  onChange,
  value,
  error,
  loading,
}: DataSetFilterProps<TFilter>) => {
  const handleChange = (
    newValue: {
      label: string;
      value: number;
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
      content={
        error &&
        'Error fetching datasets, please make sure you have datasetsAcl:READ'
      }
    >
      <MultiSelectFilter<number>
        label="Data set"
        options={options || []}
        isDisabled={error}
        onChange={(_, newValues) => handleChange(newValues)}
        value={value || []}
      />
    </Tooltip>
  );
};

const CommonDataSetFilter = (
  props: BaseMultiSelectFilterProps<DataSetWithCount, number>
) => {
  const { data: datasetOptions = [], isError } = useDatasetsListQuery({
    filterArchivedItems: true,
  });

  const options = datasetOptions.map((dataset: DataSetInternal) => {
    const name = dataset?.name || '';
    const label = name.length > 0 ? name : `${dataset.id}`;
    return {
      label: `${label}`,
      value: dataset.id,
    };
  });

  return <DataSetFilter {...props} error={isError} options={options} />;
};

DataSetFilter.Common = CommonDataSetFilter;
