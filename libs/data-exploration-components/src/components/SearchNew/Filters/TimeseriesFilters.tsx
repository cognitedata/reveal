import React from 'react';

import {
  AggregatedFilterV2,
  MetadataFilterV2,
} from '@data-exploration/containers';

import { InternalTimeseriesFilters } from '@data-exploration-lib/core';
import { useTimeseriesList } from '@data-exploration-lib/domain-layer';

import { useAdvancedFiltersEnabled } from '../../../hooks';
import { getTimeseriesFilterUnit } from '../../../utils';

import { AggregatedMultiselectFilter } from './AggregatedMultiselectFilter/AggregatedMultiselectFilter';
import { BaseFilterCollapse } from './BaseFilterCollapse/BaseFilterCollapse';
import { BooleanFilter } from './BooleanFilter/BooleanFilter';

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
