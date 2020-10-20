import React, { useCallback, useContext } from 'react';
import { CogniteEvent } from '@cognite/sdk';
import { ResourceSelectionContext } from 'lib/context';
import { Select } from 'lib/components';
import { Title } from '@cognite/cogs.js';

export const EventSubTypeFilter = ({ items }: { items: CogniteEvent[] }) => {
  const { eventFilter, setEventFilter } = useContext(ResourceSelectionContext);
  const currentSubType = eventFilter.subtype;

  const setSubType = useCallback(
    (value?: string) => {
      const newSubType = value && value.length > 0 ? value : undefined;
      setEventFilter(currentFilter => ({
        ...currentFilter,
        subtype: newSubType,
      }));
    },
    [setEventFilter]
  );

  const subtypes: Set<string> = new Set();
  items.forEach(el => {
    if (el.subtype) {
      subtypes.add(el.subtype);
    }
  });

  return (
    <>
      <Title level={4} style={{ marginBottom: 12 }} className="title">
        Sub-type
      </Title>
      <Select
        creatable
        value={
          currentSubType
            ? { value: currentSubType, label: currentSubType }
            : undefined
        }
        onChange={item => {
          if (item) {
            setSubType((item as { value: string }).value);
          } else {
            setSubType(undefined);
          }
        }}
        options={[...subtypes].map(el => {
          return {
            value: el,
            label: el,
          };
        })}
      />
    </>
  );
};
