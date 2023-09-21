import { useMemo } from 'react';

import {
  FilterFacetTitle,
  reactSelectCogsStylingProps,
} from '@data-exploration/containers';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';

import {
  DATA_EXPLORATION_COMPONENT,
  InternalEventsFilters,
  useMetrics,
} from '@data-exploration-lib/core';
import {
  EventProperty,
  useEventsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';

import { MultiSelectFilter } from '../../../MultiSelectFilter';
import { Select } from '../../../Select/Select';

export const AggregatedEventFilterV2 = ({
  field,
  filter,
  title,
  setValue,
  value,
  isMulti = false,
}: {
  field: EventProperty;
  filter: InternalEventsFilters;
  title: string;
  setValue: (newValue?: string | string[]) => void;
  value?: string | string[];
  isMulti?: boolean;
}): JSX.Element => {
  const trackUsage = useMetrics();

  const { data = [] } = useEventsUniqueValuesByProperty({
    property: field,
    filter,
  });

  const options = useMemo(() => {
    return data.map(({ value: eventType, count }) => ({
      label: `${String(eventType)} (${count})`,
      value: String(eventType),
    }));
  }, [data]);

  const handleUpdate = (newValue?: string): void => {
    setValue(newValue && newValue.length > 0 ? newValue : undefined);
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.AGGREGATE_EVENT_FILTER, {
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

  return (
    <>
      <FilterFacetTitle>{title}</FilterFacetTitle>
      <Select
        creatable
        value={isString(value) ? { value: value, label: value } : undefined}
        onChange={(item) => {
          if (item) {
            handleUpdate((item as { value: string }).value);
          } else {
            handleUpdate(undefined);
          }
        }}
        {...reactSelectCogsStylingProps}
        options={data.map(({ value: eventType }) => ({
          value: eventType,
          label: String(eventType),
        }))}
      />
    </>
  );
};
