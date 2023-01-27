import React from 'react';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import {
  useFilterEmptyState,
  useResetTimeseriesFilters,
  useTimeseriesFilters,
} from '@data-exploration-app/store/filter';
import { BooleanFilter, MetadataFilterV2 } from '@cognite/data-exploration';
import { TempMultiSelectFix } from '@data-exploration-app/containers/elements';
import { SPECIFIC_INFO_CONTENT } from '@data-exploration-app/containers/constants';
import {
  useTimeseriesList,
  useTimeseriesMetadataKeysAggregateQuery,
  useTimeseriesMetadataValuesAggregateQuery,
} from '@data-exploration-lib/domain-layer';
import { useFlagAdvancedFilters } from '@data-exploration-app/hooks';
import { AggregatedTimeseriesFilterV2 } from '@data-exploration-components/components/SearchNew';

export const TimeseriesFilters = ({ ...rest }) => {
  const [timeseriesFilter, setTimeseriesFilter] = useTimeseriesFilters();
  const resetTimeseriesFilters = useResetTimeseriesFilters();
  const isFiltersEmpty = useFilterEmptyState('timeseries');
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();

  const { data: metadataKeys = [] } =
    useTimeseriesMetadataKeysAggregateQuery(timeseriesFilter);

  const { items } = useTimeseriesList(
    timeseriesFilter,
    isAdvancedFiltersEnabled
  );

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

        <AggregatedTimeseriesFilterV2
          field="unit"
          filter={isAdvancedFiltersEnabled ? {} : timeseriesFilter}
          setValue={(newValue) => {
            setTimeseriesFilter({ unit: newValue });
          }}
          title="Unit"
          value={timeseriesFilter.unit || []}
          isMulti={isAdvancedFiltersEnabled}
        />

        <MetadataFilterV2
          items={items}
          keys={metadataKeys}
          value={timeseriesFilter.metadata}
          setValue={(newMetadata) =>
            setTimeseriesFilter({
              metadata: newMetadata,
            })
          }
          useAggregateMetadataValues={useTimeseriesMetadataValuesAggregateQuery}
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
