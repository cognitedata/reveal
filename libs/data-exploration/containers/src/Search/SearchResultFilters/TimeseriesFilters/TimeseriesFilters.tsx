import { BaseFilterCollapse } from '@data-exploration/components'; //??

import {
  FilterProps,
  SPECIFIC_INFO_CONTENT,
  hasObjectAnyProperty,
} from '@data-exploration-lib/core';

import {
  IsStepFilter,
  IsStringFilter,
  MetadataFilter,
  UnitFilter,
} from '../../../Filters';
import { TempMultiSelectFix } from '../elements';

export const TimeseriesFilters: React.FC<FilterProps> = ({
  filter,
  onFilterChange,
  onResetFilterClick,
  query,
  ...rest
}) => {
  const timeSeriesFilter = filter.timeSeries;
  const isResetButtonVisible = hasObjectAnyProperty(timeSeriesFilter, [
    'metadata',
    'isStep',
    'isString',
    'unit',
  ]);
  return (
    <BaseFilterCollapse.Panel
      title="Time series"
      hideResetButton={!isResetButtonVisible}
      infoContent={SPECIFIC_INFO_CONTENT}
      onResetClick={() => onResetFilterClick('timeSeries')}
      {...rest}
    >
      <TempMultiSelectFix>
        <IsStepFilter
          value={timeSeriesFilter.isStep}
          onChange={(newValue) =>
            onFilterChange('timeSeries', { isStep: newValue })
          }
        />

        <IsStringFilter
          value={timeSeriesFilter.isString}
          onChange={(newValue) =>
            onFilterChange('timeSeries', { isString: newValue })
          }
        />

        <UnitFilter.Timeseries
          query={query}
          filter={timeSeriesFilter}
          value={timeSeriesFilter.unit}
          onChange={(newUnit) =>
            onFilterChange('timeSeries', { unit: newUnit })
          }
        />

        <MetadataFilter.Timeseries
          query={query}
          filter={timeSeriesFilter}
          values={timeSeriesFilter.metadata}
          onChange={(newMetadata) => {
            onFilterChange('timeSeries', {
              metadata: newMetadata,
            });
          }}
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
