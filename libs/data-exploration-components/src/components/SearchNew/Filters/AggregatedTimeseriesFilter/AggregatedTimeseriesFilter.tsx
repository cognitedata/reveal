import { useMemo } from 'react';

import {
  FilterFacetTitle,
  reactSelectCogsStylingProps,
} from '@data-exploration/containers';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';

import {
  DATA_EXPLORATION_COMPONENT,
  InternalTimeseriesFilters,
  useMetrics,
} from '@data-exploration-lib/core';
import {
  TimeseriesProperty,
  useTimeseriesUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';

import { MultiSelectFilter } from '../../../MultiSelectFilter';
import { Select } from '../../../Select/Select';

export const AggregatedTimeseriesFilterV2 = ({
  field,
  filter,
  title,
  setValue,
  value,
  isMulti = false,
}: {
  field: TimeseriesProperty;
  filter: InternalTimeseriesFilters;
  title: string;
  setValue: (newValue?: string | string[]) => void;
  value?: string | string[];
  isMulti?: boolean;
}): JSX.Element => {
  const trackUsage = useMetrics();

  const { data = [] } = useTimeseriesUniqueValuesByProperty({
    property: field,
    filter,
  });

  const options = useMemo(() => {
    return data.map(({ values: unit, count }) => ({
      label: `${unit} (${count})`,
      value: String(unit),
    }));
  }, [data]);

  const handleUpdate = (newValue?: string): void => {
    setValue(newValue && newValue.length > 0 ? newValue : undefined);
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.AGGREGATE_TIMESERIES_FILTER, {
      value: newValue,
      title,
    });
  };

  if (isMulti && isArray(value)) {
    return (
      <MultiSelectFilter
        title={title}
        options={options}
        value={value}
        onChange={(items) => {
          if (items) {
            setValue(items);
          }
        }}
      />
    );
  }

  const selectedValue = isString(value)
    ? { value: value, label: value }
    : undefined;
  return (
    <>
      <FilterFacetTitle>{title}</FilterFacetTitle>
      <Select
        creatable
        value={selectedValue}
        onChange={(item) => {
          if (item) {
            handleUpdate((item as { value: string }).value);
          } else {
            handleUpdate(undefined);
          }
        }}
        {...reactSelectCogsStylingProps}
        options={data.map(({ values: unit }) => ({
          value: String(unit),
          label: String(unit),
        }))}
      />
    </>
  );
};
