import React from 'react';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import {
  useFilterEmptyState,
  useResetTimeseriesFilters,
  useTimeseriesFilters,
} from '@data-exploration-app/store/filter';
import {
  AggregatedFilterV2,
  BooleanFilter,
  getTimeseriesFilterUnit,
  MetadataFilterV2,
} from '@cognite/data-exploration';
import { TempMultiSelectFix } from '@data-exploration-app/containers/elements';
import { SPECIFIC_INFO_CONTENT } from '@data-exploration-app/containers/constants';
import { useTimeseriesList } from '@data-exploration-lib/domain-layer';
import { AggregatedMultiselectFilter } from '@data-exploration-components/components/SearchNew';
import { useFlagAdvancedFilters } from '@data-exploration-app/hooks';

export const TimeseriesFilters = ({ ...rest }) => {
  const [timeseriesFilter, setTimeseriesFilter] = useTimeseriesFilters();
  const resetTimeseriesFilters = useResetTimeseriesFilters();
  const isFiltersEmpty = useFilterEmptyState('timeseries');
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();

  const { items } = useTimeseriesList(
    timeseriesFilter,
    isAdvancedFiltersEnabled
  );
  const unit = timeseriesFilter.unit;
  return (
    <BaseFilterCollapse.Panel
      title="Time series"
      infoContent={SPECIFIC_INFO_CONTENT}
      hideResetButton={isFiltersEmpty}
      onResetClick={resetTimeseriesFilters}
      {...rest}
    >
      <TempMultiSelectFix>
        <BooleanFilter
          title="Is step"
          value={timeseriesFilter.isStep}
          setValue={(newValue) =>
            setTimeseriesFilter({
              isStep: newValue,
            })
          }
        />
        <BooleanFilter
          title="Is string"
          value={timeseriesFilter.isString}
          setValue={(newValue) =>
            setTimeseriesFilter({
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
            setValue={(newValue) => setTimeseriesFilter({ unit: newValue })}
          />
        ) : (
          <AggregatedFilterV2
            items={items}
            aggregator="unit"
            title="Unit"
            addNilOption
            value={unit ? String(unit) : unit}
            setValue={(newValue) => setTimeseriesFilter({ unit: newValue })}
          />
        )}

        <MetadataFilterV2
          items={items}
          value={timeseriesFilter.metadata}
          setValue={(newMetadata) =>
            setTimeseriesFilter({
              metadata: newMetadata,
            })
          }
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
