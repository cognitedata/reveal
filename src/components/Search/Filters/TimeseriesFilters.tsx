import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { ResetFiltersButton } from './ResetFiltersButton';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';
import { BooleanFilter } from './BooleanFilter/BooleanFilter';
import { AggregatedFilter } from './AggregatedFilter/AggregatedFilter';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { StringFilter } from './StringFilter/StringFilter';
import { DateFilter } from './DateFilter/DateFilter';
import { AdvancedFiltersCollapse } from './AdvancedFiltersCollapse';
import { OldTimeseriesFilters } from 'domain/timeseries';
import { transformNewFilterToOldFilter } from 'domain/transformers';

export const TimeseriesFilters = ({
  filter,
  setFilter,
}: {
  filter: OldTimeseriesFilters;
  setFilter: (newFilter: OldTimeseriesFilters) => void;
}) => {
  const { data: items = [] } = useList('timeseries', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <div>
      <ResetFiltersButton setFilter={setFilter} />
      <DataSetFilter
        resourceType="timeSeries"
        value={filter.dataSetIds?.map(({ value }) => ({ id: value }))}
        setValue={newIds =>
          setFilter({
            ...filter,
            dataSetIds: newIds?.map(({ id }: any) => ({ value: id })),
          })
        }
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

      <AdvancedFiltersCollapse resourceType="timeSeries" filter={filter}>
        <ByAssetFilter
          value={filter.assetSubtreeIds?.map(({ value }) => value)}
          setValue={newValue =>
            setFilter({
              ...filter,
              assetSubtreeIds: newValue?.map(id => ({ value: id })),
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
      </AdvancedFiltersCollapse>
    </div>
  );
};
