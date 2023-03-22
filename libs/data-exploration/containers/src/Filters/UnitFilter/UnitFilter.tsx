import * as React from 'react';

import { useTimeseriesUniqueValuesByProperty } from '@data-exploration-lib/domain-layer';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter } from '../types';

import { OptionType } from '@cognite/cogs.js';
import { InternalTimeseriesFilters } from '@data-exploration-lib/core';

interface BaseUnitFilterProps<TFilter> extends BaseFilter<TFilter> {
  value?: OptionType<string>[];
  onChange?: (newSources: OptionType<string>[]) => void;
  addNilOption?: boolean;
}

export interface UnitFilterProps<TFilter> extends BaseUnitFilterProps<TFilter> {
  options: OptionType<string>[];
}

export function UnitFilter<TFilter>({
  options,
  onChange,
  ...rest
}: UnitFilterProps<TFilter>) {
  return (
    <MultiSelectFilter<string>
      {...rest}
      label="Unit"
      options={options}
      onChange={(_, unit) => onChange?.(unit)}
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

  const options = units.map((item) => ({
    label: `${item.values[0]}`,
    value: `${item.values[0]}`,
  }));

  return <UnitFilter {...props} options={options} />;
};

UnitFilter.Timeseries = TimeseriesUnitFilter;
