import {
  MultiSelectFilter,
  Select,
} from '@data-exploration-components/components';
import { FilterFacetTitle } from '../FilterFacetTitle';
import { reactSelectCogsStylingProps } from '../elements';
import {
  InternalEventsFilters,
  useEventsAggregateUniqueValuesQuery,
} from '@data-exploration-lib/domain-layer';
import { useMetrics } from '@data-exploration-components/hooks/useMetrics';
import { DATA_EXPLORATION_COMPONENT } from '@data-exploration-components/constants/metrics';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';

type EventFieldForAggregate = 'type' | 'subtype' | 'dataSetId';

export const AggregatedEventFilterV2 = ({
  field,
  filter,
  title,
  setValue,
  value,
  isMulti = false,
}: {
  field: EventFieldForAggregate;
  filter: InternalEventsFilters;
  title: string;
  setValue: (newValue?: string | string[]) => void;
  value?: string | string[];
  isMulti?: boolean;
}): JSX.Element => {
  const trackUsage = useMetrics();

  const { data = [] } = useEventsAggregateUniqueValuesQuery({
    filter,
    aggregateOptions: {
      fields: [field],
    },
  });

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
        creatable
        options={data.map(({ value: eventType }) => ({
          value: String(eventType),
          label: String(eventType),
        }))}
        values={value}
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
