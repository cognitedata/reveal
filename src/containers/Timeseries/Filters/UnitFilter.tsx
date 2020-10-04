import React, { useContext } from 'react';
import { Timeseries } from 'cognite-sdk-v3';
import { ResourceSelectionContext } from 'context';
import { Select } from 'components/Common';
import { Title } from '@cognite/cogs.js';

export const UnitFilter = ({ items }: { items: Timeseries[] }) => {
  const { timeseriesFilter, setTimeseriesFilter } = useContext(
    ResourceSelectionContext
  );

  const units: Set<string> = new Set();
  items.forEach(el => {
    if (el.unit) {
      units.add(el.unit);
    }
  });

  return (
    <>
      <Title level={4} style={{ marginBottom: 12 }} className="title">
        Unit type
      </Title>
      <Select
        value={
          timeseriesFilter.unit
            ? { value: timeseriesFilter.unit, label: timeseriesFilter.unit }
            : undefined
        }
        onChange={item => {
          if (!item) {
            setTimeseriesFilter(filter => ({ ...filter, unit: undefined }));
          } else {
            setTimeseriesFilter(filter => ({
              ...filter,
              unit: (item as { value: string }).value,
            }));
          }
        }}
        options={[...units].map(el => {
          return {
            value: el,
            label: el,
          };
        })}
      />
    </>
  );
};
