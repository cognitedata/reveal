import React from 'react';

import { useSDK } from '@cognite/sdk-provider';
import { aggregateKey } from '@cognite/sdk-react-query-hooks';
import { useQuery } from 'react-query';

import {
  MultiSelectFilterNew,
  Select,
} from '@data-exploration-components/components';
import { FilterFacetTitle } from '../FilterFacetTitle';
import { reactSelectCogsStylingProps } from '../elements';
import { InternalEventsFilters } from '@data-exploration-lib/domain-layer';
import { transformNewFilterToOldFilter } from '@data-exploration-lib/domain-layer';
import { useMetrics } from '@data-exploration-components/hooks/useMetrics';
import { DATA_EXPLORATION_COMPONENT } from '@data-exploration-components/constants/metrics';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';

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
  isMulti = false,
}: {
  field: EventFieldForAggregate;
  filter: InternalEventsFilters;
  title: string;
  setValue: (newValue?: string | string[]) => void;
  value?: string | string[];
  isMulti?: boolean;
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
      {isMulti && isArray(value) ? (
        <MultiSelectFilterNew
          title={title}
          creatable
          options={[...data].map(({ value: eventType }) => ({
            value: eventType,
            label: String(eventType),
          }))}
          values={value}
          onChange={(items: string[]) => {
            if (items) {
              setValue(items);
            }
          }}
        />
      ) : (
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
            options={[...data].map(({ value: eventType }) => ({
              value: eventType,
              label: String(eventType),
            }))}
          />
        </>
      )}
    </>
  );
};
