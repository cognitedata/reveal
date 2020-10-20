import React, { useCallback, useContext } from 'react';
import { CogniteEvent } from '@cognite/sdk';
import { ResourceSelectionContext } from 'lib/context';
import { Select } from 'lib/components';
import { Title } from '@cognite/cogs.js';

export const EventTypeFilter = ({ items }: { items: CogniteEvent[] }) => {
  const { eventFilter, setEventFilter } = useContext(ResourceSelectionContext);
  const currentType = eventFilter.type;

  const setType = useCallback(
    (value?: string) => {
      const newType = value && value.length > 0 ? value : undefined;
      setEventFilter(currentFilter => ({
        ...currentFilter,
        type: newType,
      }));
    },
    [setEventFilter]
  );

  const types: Set<string> = new Set();
  items.forEach(el => {
    if (el.type) {
      types.add(el.type);
    }
  });

  return (
    <>
      <Title level={4} style={{ marginBottom: 12 }} className="title">
        Type
      </Title>
      <Select
        creatable
        value={
          currentType ? { value: currentType, label: currentType } : undefined
        }
        onChange={item => {
          if (item) {
            setType((item as { value: string }).value);
          } else {
            setType(undefined);
          }
        }}
        options={[...types].map(el => {
          return {
            value: el,
            label: el,
          };
        })}
      />
    </>
  );
};
