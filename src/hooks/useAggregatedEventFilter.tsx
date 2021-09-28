import React from 'react';

import { Body } from '@cognite/cogs.js';
import { EventFilter } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { aggregateKey } from '@cognite/sdk-react-query-hooks';
import { useQuery } from 'react-query';

import { Select } from 'components';

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

  return useQuery(eventAggregateKey(aggregate, field, filter), async () =>
    sdk.events.aggregate.uniqueValues({
      filter,
      fields: [field],
    })
  );
};

export const useAggregatedEventFilter = ({
  field,
  filter,
  title,
  onUpdate,
  value,
}: {
  field: EventFieldForAggregate;
  filter: EventFilter;
  title: string;
  onUpdate: (newValue?: string) => void;
  value?: string;
}): JSX.Element => {
  const { data = [] } = useEventAggregate('uniqueValues', field, filter);

  const handleUpdate = (newValue?: string): void => {
    onUpdate(newValue && newValue.length > 0 ? newValue : undefined);
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
        onChange={item => {
          if (item) {
            handleUpdate((item as { value: string }).value);
          } else {
            handleUpdate(undefined);
          }
        }}
        options={[...data].map(({ value: eventType }) => ({
          value: eventType,
          label: eventType,
        }))}
      />
    </>
  );
};
