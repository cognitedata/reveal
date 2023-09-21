import React from 'react';

import { MetadataFilterV2 } from '@data-exploration/containers';
import { AggregatedTimeseriesFilterV2 } from '@data-exploration-components/components/SearchNew';

import { BooleanFilter } from '@cognite/data-exploration';

import {
  useTimeseriesList,
  useTimeseriesMetadataKeysAggregateQuery,
  useTimeseriesMetadataValuesAggregateQuery,
} from '@data-exploration-lib/domain-layer';

import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import { useFlagAdvancedFilters } from '../../hooks';
import {
  useFilterEmptyState,
  useResetTimeseriesFilters,
  useTimeseriesFilters,
} from '../../store';
import { SPECIFIC_INFO_CONTENT } from '../constants';
import { TempMultiSelectFix } from '../elements';

export const TimeseriesFilters = ({ ...rest }) => {
  const [timeseriesFilter, setTimeseriesFilter] = useTimeseriesFilters();
  const resetTimeseriesFilters = useResetTimeseriesFilters();
  const isFiltersEmpty = useFilterEmptyState('timeSeries');
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();

  const { data: metadataKeys = [] } = useTimeseriesMetadataKeysAggregateQuery();

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
          useAggregateMetadataValues={(metadataKey) =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useTimeseriesMetadataValuesAggregateQuery({ metadataKey })
          }
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
