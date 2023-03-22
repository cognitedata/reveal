import React from 'react';
import { ResetFiltersButton } from './ResetFiltersButton';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';
import { BooleanFilter } from './BooleanFilter/BooleanFilter';
import { AggregatedFilter } from './AggregatedFilter/AggregatedFilter';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { StringFilter } from './StringFilter/StringFilter';
import { DateFilter } from './DateFilter/DateFilter';
import { AdvancedFiltersCollapse } from './AdvancedFiltersCollapse';
import { useTimeseriesList } from '@data-exploration-lib/domain-layer';
import { ResourceTypes } from '@data-exploration-components/types';
import { AggregatedMultiselectFilter } from '@data-exploration-components/components/SearchNew';
import { useAdvancedFiltersEnabled } from '@data-exploration-components/hooks';
import { getTimeseriesFilterUnit } from '@data-exploration-components/utils';
import { OldTimeseriesFilters } from '@data-exploration-lib/core';

export const TimeseriesFilters = ({
  filter,
  setFilter,
}: {
  filter: OldTimeseriesFilters;
  setFilter: (newFilter: OldTimeseriesFilters) => void;
}) => {
  const resourceType = ResourceTypes.TimeSeries;

  const isAdvancedFiltersEnabled = useAdvancedFiltersEnabled();

  const { items } = useTimeseriesList(filter, isAdvancedFiltersEnabled);
  const unit = filter.unit;

  return (
    <div>
      <ResetFiltersButton setFilter={setFilter} resourceType={resourceType} />
      <DataSetFilter
        resourceType={resourceType}
        value={filter.dataSetIds?.map(({ value }) => ({ id: value }))}
        setValue={(newIds) =>
          setFilter({
            ...filter,
            dataSetIds: newIds?.map(({ id }: any) => ({ value: id })),
          })
        }
      />

      <BooleanFilter
        title="Is step"
        value={filter.isStep}
        setValue={(newValue) =>
          setFilter({
            ...filter,
            isStep: newValue,
          })
        }
      />
      <BooleanFilter
        title="Is string"
        value={filter.isString}
        setValue={(newValue) =>
          setFilter({
            ...filter,
            isString: newValue,
          })
        }
      />
      <StringFilter
        title="External ID"
        value={filter.externalIdPrefix}
        setValue={(newExternalId) =>
          setFilter({
            ...filter,
            externalIdPrefix: newExternalId,
          })
        }
      />

      <AdvancedFiltersCollapse resourceType={resourceType} filter={filter}>
        <ByAssetFilter
          value={filter.assetSubtreeIds?.map(({ value }) => value)}
          setValue={(newValue) =>
            setFilter({
              ...filter,
              assetSubtreeIds: newValue?.map((id) => ({ value: id })),
            })
          }
        />
        {isAdvancedFiltersEnabled ? (
          <AggregatedMultiselectFilter
            items={items}
            aggregator="unit"
            title="Unit"
            addNilOption
            value={getTimeseriesFilterUnit(unit)}
            setValue={(newValue) => setFilter({ ...filter, unit: newValue })}
          />
        ) : (
          <AggregatedFilter
            items={items}
            aggregator="unit"
            title="Unit"
            value={unit ? String(unit) : unit}
            setValue={(newValue) => setFilter({ ...filter, unit: newValue })}
          />
        )}
        <MetadataFilter
          items={items}
          value={filter.metadata}
          setValue={(newMetadata) =>
            setFilter({
              ...filter,
              metadata: newMetadata,
            })
          }
        />
        <DateFilter
          title="Created Time"
          value={filter.createdTime}
          setValue={(newDate) =>
            setFilter({
              ...filter,
              createdTime: newDate || undefined,
            })
          }
        />
        <DateFilter
          title="Updated Time"
          value={filter.lastUpdatedTime}
          setValue={(newDate) =>
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
