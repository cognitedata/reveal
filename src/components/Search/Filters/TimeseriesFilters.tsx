import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import {
  InternalId,
  TimeseriesFilter as TimeseriesFilterProps,
} from '@cognite/sdk';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';
import { BooleanFilter } from './BooleanFilter/BooleanFilter';
import { AggregatedFilter } from './AggregatedFilter/AggregatedFilter';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { StringFilter } from './StringFilter/StringFilter';
import { DateFilter } from './DateFilter/DateFilter';

export const TimeseriesFilters = ({
  filter,
  setFilter,
}: {
  filter: TimeseriesFilterProps;
  setFilter: (newFilter: TimeseriesFilterProps) => void;
}) => {
  const { data: items = [] } = useList('timeseries', { filter, limit: 1000 });
  return (
    <div>
      <DataSetFilter
        resourceType="timeSeries"
        value={filter.dataSetIds}
        setValue={newIds =>
          setFilter({
            ...filter,
            dataSetIds: newIds,
          })
        }
      />
      <ByAssetFilter
        value={filter.assetSubtreeIds?.map(el => (el as InternalId).id)}
        setValue={newValue =>
          setFilter({
            ...filter,
            assetSubtreeIds: newValue?.map(id => ({ id })),
          })
        }
      />
      <AggregatedFilter
        items={items}
        aggregator="unit"
        title="Unit"
        value={filter.unit}
        setValue={newValue => setFilter({ ...filter, unit: newValue })}
      />
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
      <StringFilter
        title="External ID"
        value={filter.externalIdPrefix}
        setValue={newExternalId =>
          setFilter({
            ...filter,
            externalIdPrefix: newExternalId,
          })
        }
      />
      <MetadataFilter
        items={items}
        value={filter.metadata}
        setValue={newMetadata =>
          setFilter({
            ...filter,
            metadata: newMetadata,
          })
        }
      />
      <DateFilter
        title="Created Time"
        value={filter.createdTime}
        setValue={newDate =>
          setFilter({
            ...filter,
            createdTime: newDate || undefined,
          })
        }
      />
      <DateFilter
        title="Updated Time"
        value={filter.lastUpdatedTime}
        setValue={newDate =>
          setFilter({
            ...filter,
            lastUpdatedTime: newDate || undefined,
          })
        }
      />
    </div>
  );
};
