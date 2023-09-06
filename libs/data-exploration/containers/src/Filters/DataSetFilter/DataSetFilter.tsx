import { OptionType, Tooltip } from '@cognite/cogs.js';

import {
  DATA_EXPLORATION_COMPONENT,
  ResourceType,
  useMetrics,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  DataSetInternal,
  DataSetWithCount,
  useDatasetsListQuery,
} from '@data-exploration-lib/domain-layer';

import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseMultiSelectFilterProps } from '../types';

interface DataSetFilterProps<TFilter>
  extends BaseMultiSelectFilterProps<TFilter, number> {
  options: OptionType<number>[];
  resourceType?: ResourceType;
}

export const DataSetFilter = <TFilter,>({
  options,
  onChange,
  value,
  isError,
  isLoading,
  ...rest
}: DataSetFilterProps<TFilter>) => {
  const trackUsage = useMetrics();
  const { t } = useTranslation();

  const handleChange = (
    newValue: {
      label: string;
      value: number;
    }[]
  ) => {
    const newFilters = newValue && newValue.length > 0 ? newValue : undefined;
    onChange?.(newFilters);
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.DATA_SET_FILTER, {
      ...newValue,
    });
  };

  return (
    <Tooltip
      interactive
      disabled={!isError}
      content={
        isError &&
        t(
          'PERMISSIONS_ERROR_FETCHING',
          'Error fetching datasets, please make sure you have datasetsAcl:READ',
          {
            dataType: 'datasets',
            permissionType: 'datasetsAcl:READ',
          }
        )
      }
    >
      <MultiSelectFilter<number>
        {...rest}
        label={t('DATA_SETS', 'Data sets')}
        options={options || []}
        isLoading={isLoading}
        isDisabled={isError}
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

  const options = datasetOptions
    .map((dataset: DataSetInternal) => {
      const name = dataset?.name || '';
      const label = name.length > 0 ? name : `${dataset.id}`;
      return {
        label: `${label}`,
        value: dataset.id,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return <DataSetFilter {...props} isError={isError} options={options} />;
};

DataSetFilter.Common = CommonDataSetFilter;
