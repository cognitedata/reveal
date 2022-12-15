import React from 'react';

import { useSDK } from '@cognite/sdk-provider';
import { aggregateKey } from '@cognite/sdk-react-query-hooks';
import { useQuery } from 'react-query';

import { Select } from 'components';
import { FilterFacetTitle } from '../FilterFacetTitle';
import { reactSelectCogsStylingProps } from '../elements';
import { InternalEventsFilters } from 'domain/events';
import { transformNewFilterToOldFilter } from 'domain/transformers';
import { useMetrics } from 'hooks/useMetrics';
import { DATA_EXPLORATION_COMPONENT } from 'constants/metrics';

type EventFieldForAggregate = 'type' | 'subtype' | 'dataSetId';

const eventAggregateKey = (
  aggregate: string,
  field: EventFieldForAggregate,
  filter?: any
): string[] => [...aggregateKey('events', filter), aggregate, field];

const useEventAggregate = (
  aggregate: string,
  field: EventFieldForAggregate,
  filter?: any
) => {
  const sdk = useSDK();
  filter = transformNewFilterToOldFilter(filter);
  return useQuery(eventAggregateKey(aggregate, field, filter), async () =>
    sdk.events.aggregate.uniqueValues({
      filter,
      fields: [field],
    })
  );
};

export const AggregatedEventFilterV2 = ({
  field,
  filter,
  title,
  setValue,
  value,
}: {
  field: EventFieldForAggregate;
  filter: InternalEventsFilters;
  title: string;
  setValue: (newValue?: string) => void;
  value?: string;
}): JSX.Element => {
  const { data = [] } = useEventAggregate('uniqueValues', field, filter);
  const trackUsage = useMetrics();

  const handleUpdate = (newValue?: string): void => {
    setValue(newValue && newValue.length > 0 ? newValue : undefined);
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.AGGREGATE_EVENT_FILTER, {
      value: newValue,
      title,
    });
  };

  return (
    <>
      <FilterFacetTitle>{title}</FilterFacetTitle>
      <Select
        creatable
        value={value ? { value, label: value } : undefined}
        onChange={item => {
          if (item) {
            handleUpdate((item as { value: string }).value);
          } else {
            handleUpdate(undefined);
          }
        }}
        {...reactSelectCogsStylingProps}
        options={[...data].map(({ value: eventType }) => ({
          value: eventType,
          label: String(eventType),
        }))}
      />
    </>
  );
};
