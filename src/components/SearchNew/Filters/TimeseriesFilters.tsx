import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { TimeseriesFilter as TimeseriesFilterProps } from '@cognite/sdk';
import { BooleanFilter } from './BooleanFilter/BooleanFilter';
import { AggregatedFilterV2 } from './AggregatedFilter/AggregatedFilter';
import { MetadataFilterV2 } from './MetadataFilter/MetadataFilter';
import { BaseFilterCollapse } from './BaseFilterCollapse/BaseFilterCollapse';

export const TimeseriesFilters = ({
  filter,
  setFilter,
  ...rest
}: {
  filter: TimeseriesFilterProps;
  setFilter: (newFilter: TimeseriesFilterProps) => void;
}) => {
  const { data: items = [] } = useList('timeseries', { filter, limit: 1000 });

  return (
    <BaseFilterCollapse.Panel title="Time series" {...rest}>
      <BooleanFilter
        title="Is step"
        value={filter.isStep}
        setValue={newValue =>
          setFilter({
            ...filter,
            isStep: newValue,
          })
        }
      />
      <BooleanFilter
        title="Is string"
        value={filter.isString}
        setValue={newValue =>
          setFilter({
            ...filter,
            isString: newValue,
          })
        }
      />

      <AggregatedFilterV2
        items={items}
        aggregator="unit"
        title="Unit"
        value={filter.unit}
        setValue={newValue => setFilter({ ...filter, unit: newValue })}
      />

      <MetadataFilterV2
        items={items}
        value={filter.metadata}
        setValue={newMetadata =>
          setFilter({
            ...filter,
            metadata: newMetadata,
          })
        }
      />
    </BaseFilterCollapse.Panel>
  );
};
