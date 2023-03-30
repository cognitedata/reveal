import * as React from 'react';

import { useTimeseriesUniqueValuesByProperty } from '@data-exploration-lib/domain-layer';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter, CommonFilterProps, MultiSelectOptionType } from '../types';
import { transformOptionsForMultiselectFilter } from '../utils';
import {
  InternalTimeseriesFilters,
  useDeepMemo,
} from '@data-exploration-lib/core';

interface BaseUnitFilterProps<TFilter>
  extends BaseFilter<TFilter>,
    CommonFilterProps {
  value?: string | string[];
  onChange?: (newSources: string | string[]) => void;
  addNilOption?: boolean;
}

export interface UnitFilterProps<TFilter> extends BaseUnitFilterProps<TFilter> {
  options: MultiSelectOptionType<string>[];
}

export function UnitFilter<TFilter>({
  options,
  onChange,
  value,
  ...rest
}: UnitFilterProps<TFilter>) {
  return (
    <MultiSelectFilter<string>
      {...rest}
      label="Unit"
      value={value ? transformOptionsForMultiselectFilter(value) : undefined}
      options={options}
      onChange={(_, unit) => onChange?.(unit.map((u) => u.value))}
    />
  );
}

const TimeseriesUnitFilter = (
  props: BaseUnitFilterProps<InternalTimeseriesFilters>
) => {
  const {
    data: units = [],
    isLoading,
    isError,
  } = useTimeseriesUniqueValuesByProperty('unit', props.filter);

  const options = useDeepMemo(
    () =>
      units.map((item) => ({
        label: String(item.values),
        value: String(item.values),
        count: item.count,
      })),
    [units]
  );

  return (
    <UnitFilter
      {...props}
      isError={isError}
      isLoading={isLoading}
      options={options}
    />
  );
};

UnitFilter.Timeseries = TimeseriesUnitFilter;
