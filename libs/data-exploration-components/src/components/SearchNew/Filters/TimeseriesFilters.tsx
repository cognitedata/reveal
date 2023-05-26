import React from 'react';

import { useAdvancedFiltersEnabled } from '@data-exploration-components/hooks';
import { getTimeseriesFilterUnit } from '@data-exploration-components/utils';
import { InternalTimeseriesFilters } from '@data-exploration-lib/core';
import { useTimeseriesList } from '@data-exploration-lib/domain-layer';

import { AggregatedFilterV2 } from './AggregatedFilter/AggregatedFilter';
import { AggregatedMultiselectFilter } from './AggregatedMultiselectFilter/AggregatedMultiselectFilter';
import { BaseFilterCollapse } from './BaseFilterCollapse/BaseFilterCollapse';
import { BooleanFilter } from './BooleanFilter/BooleanFilter';
import { MetadataFilterV2 } from './MetadataFilter/MetadataFilter';

export const TimeseriesFilters = ({
  filter,
  setFilter,
  ...rest
}: {
  filter: InternalTimeseriesFilters;
  setFilter: (newFilter: InternalTimeseriesFilters) => void;
}) => {
  const isAdvancedFiltersEnabled = useAdvancedFiltersEnabled();

  const { items } = useTimeseriesList(filter, isAdvancedFiltersEnabled);
  const unit = filter.unit;

  return (
    <BaseFilterCollapse.Panel title="Time series" {...rest}>
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
        <AggregatedFilterV2
          items={items}
          aggregator="unit"
          title="Unit"
          value={unit ? String(unit) : unit}
          setValue={(newValue) => setFilter({ ...filter, unit: newValue })}
        />
      )}

      <MetadataFilterV2
        items={items}
        value={filter.metadata}
        setValue={(newMetadata) =>
          setFilter({
            ...filter,
            metadata: newMetadata,
          })
        }
      />
    </BaseFilterCollapse.Panel>
  );
};
