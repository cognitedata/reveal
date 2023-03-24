import * as React from 'react';

import { useTimeseriesUniqueValuesByProperty } from '@data-exploration-lib/domain-layer';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter } from '../types';
import { transformOptionsForMultiselectFilter } from '../utils';
import { InternalTimeseriesFilters } from '@data-exploration-lib/core';

interface BaseUnitFilterProps<TFilter> extends BaseFilter<TFilter> {
  value?: string | string[];
  onChange?: (newSources: string | string[]) => void;
  addNilOption?: boolean;
}

export interface UnitFilterProps<TFilter> extends BaseUnitFilterProps<TFilter> {
  options: string | string[];
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
      options={transformOptionsForMultiselectFilter(options)}
      onChange={(_, unit) => onChange?.(unit.map((u) => u.value))}
    />
  );
}

const TimeseriesUnitFilter = (
  props: BaseUnitFilterProps<InternalTimeseriesFilters>
) => {
  const { data: units = [] } = useTimeseriesUniqueValuesByProperty(
    'unit',
    props.filter
  );

  const options = units.map((item) => `${item.values}`);

  return <UnitFilter {...props} options={options} />;
};

UnitFilter.Timeseries = TimeseriesUnitFilter;
