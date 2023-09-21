import React from 'react';

import { useQuery } from '@tanstack/react-query';

import { Body } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
import { aggregateKey } from '@cognite/sdk-react-query-hooks';

import {
  InternalEventsFilters,
  OldEventsFilters,
} from '@data-exploration-lib/core';
import { transformNewFilterToOldFilter } from '@data-exploration-lib/domain-layer';

import { Select } from '../../../Select/Select';

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
  const transformedfilter: any = transformNewFilterToOldFilter(filter);

  return useQuery(eventAggregateKey(aggregate, field, filter), async () =>
    sdk.events.aggregate.uniqueValues({
      filter: transformedfilter,
      fields: [field],
    })
  );
};

export const AggregatedEventFilter = ({
  field,
  filter,
  title,
  setValue,
  value,
}: {
  field: EventFieldForAggregate;
  filter: InternalEventsFilters | OldEventsFilters;
  title: string;
  setValue: (newValue?: string) => void;
  value?: string;
}): JSX.Element => {
  const { data = [] } = useEventAggregate('uniqueValues', field, filter);

  const handleUpdate = (newValue?: string): void => {
    setValue(newValue && newValue.length > 0 ? newValue : undefined);
  };

  return (
    <>
      <Body
        level={4}
        style={{ marginBottom: 5, marginTop: 10 }}
        className="title"
      >
        {title}
      </Body>
      <Select
        creatable
        value={value ? { value, label: value } : undefined}
        onChange={(item) => {
          if (item) {
            handleUpdate((item as { value: string }).value);
          } else {
            handleUpdate(undefined);
          }
        }}
        options={[...data].map(({ value: eventType }) => ({
          value: eventType,
          label: String(eventType),
        }))}
      />
    </>
  );
};
