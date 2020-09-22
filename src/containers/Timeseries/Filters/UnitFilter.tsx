import React, { useContext } from 'react';
import { Timeseries } from 'cognite-sdk-v3';
import { Select } from 'antd';
import { ResourceSelectionContext } from 'context';
import { SelectWrapper } from 'components/Common';
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
      <SelectWrapper>
        <Select
          value={timeseriesFilter.unit}
          onSelect={(el: string) => {
            setTimeseriesFilter(filter => ({ ...filter, unit: el }));
          }}
          onChange={(el: string) => {
            if (!el) {
              setTimeseriesFilter(filter => ({ ...filter, unit: undefined }));
            }
          }}
          style={{ width: '100%' }}
          allowClear
        >
          {[...units].map(el => {
            return (
              <Select.Option key={el} value={el}>
                {el}
              </Select.Option>
            );
          })}
        </Select>
      </SelectWrapper>
    </>
  );
};
