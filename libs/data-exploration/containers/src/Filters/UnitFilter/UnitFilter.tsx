import * as React from 'react';

import { useTimeseriesUniqueValuesByProperty } from '@data-exploration-lib/domain-layer';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter, CommonFilterProps, MultiSelectOptionType } from '../types';
import { transformOptionsForMultiselectFilter } from '../utils';
import {
  DATA_EXPLORATION_COMPONENT,
  InternalTimeseriesFilters,
  useDebouncedState,
  useDeepMemo,
  useMetrics,
} from '@data-exploration-lib/core';
import { InputActionMeta } from 'react-select';

interface BaseUnitFilterProps<TFilter>
  extends BaseFilter<TFilter>,
    CommonFilterProps {
  value?: string | string[];
  onChange?: (newSources: string | string[]) => void;
  onInputChange?: (newValue: string, actionMeta: InputActionMeta) => void;
  addNilOption?: boolean;
  query?: string;
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
  const trackUsage = useMetrics();

  const handleChange = (
    units: {
      label: string;
      value: string;
    }[]
  ) => {
    onChange?.(units.map((unit) => unit.value));
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.AGGREGATE_FILTER, {
      value: units,
      title: 'Unit Filter',
    });
  };

  return (
    <MultiSelectFilter<string>
      {...rest}
      label="Unit"
      value={value ? transformOptionsForMultiselectFilter(value) : undefined}
      options={options}
      onChange={(_, units) => handleChange(units)}
    />
  );
}

const TimeseriesUnitFilter = (
  props: BaseUnitFilterProps<InternalTimeseriesFilters>
) => {
  const [query, setQuery] = useDebouncedState<string | undefined>(undefined);

  const {
    data: units = [],
    isLoading,
    isError,
  } = useTimeseriesUniqueValuesByProperty('unit', query, props.filter);

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
      onInputChange={(newValue) => setQuery(newValue)}
      isError={isError}
      isLoading={isLoading}
      options={options}
    />
  );
};

UnitFilter.Timeseries = TimeseriesUnitFilter;
