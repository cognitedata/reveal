import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { BooleanFilter } from './BooleanFilter/BooleanFilter';
import { AggregatedFilterV2 } from './AggregatedFilter/AggregatedFilter';
import { MetadataFilterV2 } from './MetadataFilter/MetadataFilter';
import { BaseFilterCollapse } from './BaseFilterCollapse/BaseFilterCollapse';
import { InternalTimeseriesFilters } from 'domain/timeseries';
import { transformNewFilterToOldFilter } from 'domain/transformers';

export const TimeseriesFilters = ({
  filter,
  setFilter,
  ...rest
}: {
  filter: InternalTimeseriesFilters;
  setFilter: (newFilter: InternalTimeseriesFilters) => void;
}) => {
  const { data: items = [] } = useList('timeseries', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

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
