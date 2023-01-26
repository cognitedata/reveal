import {
  MultiSelectFilter,
  Select,
} from '@data-exploration-components/components';
import { FilterFacetTitle } from '../FilterFacetTitle';
import { reactSelectCogsStylingProps } from '../elements';
import {
  EventProperty,
  InternalEventsFilters,
  useEventsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';
import { useMetrics } from '@data-exploration-components/hooks/useMetrics';
import { DATA_EXPLORATION_COMPONENT } from '@data-exploration-components/constants/metrics';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import { useMemo } from 'react';

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

  const { data = [] } = useEventsUniqueValuesByProperty(field, filter);

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
