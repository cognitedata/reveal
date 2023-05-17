import {
  FilterProps,
  SPECIFIC_INFO_CONTENT,
  hasObjectAnyProperty,
} from '@data-exploration-lib/core';
import { BaseFilterCollapse } from '@data-exploration/components'; //??
import { TempMultiSelectFix } from '../elements';
import {
  IsStepFilter,
  IsStringFilter,
  MetadataFilter,
  UnitFilter,
} from '../../../Filters';

export const TimeseriesFilters: React.FC<FilterProps> = ({
  filter,
  onFilterChange,
  onResetFilterClick,
  query,
  ...rest
}) => {
  const timeseriesFilter = filter.timeseries;
  const isResetButtonVisible = hasObjectAnyProperty(timeseriesFilter, [
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
          value={timeseriesFilter.isStep}
          onChange={(newValue) =>
            onFilterChange('timeSeries', { isStep: newValue })
          }
        />

        <IsStringFilter
          value={timeseriesFilter.isString}
          onChange={(newValue) =>
            onFilterChange('timeSeries', { isString: newValue })
          }
        />

        <UnitFilter.Timeseries
          query={query}
          filter={timeseriesFilter}
          value={timeseriesFilter.unit}
          onChange={(newUnit) =>
            onFilterChange('timeSeries', { unit: newUnit })
          }
        />

        <MetadataFilter.Timeseries
          query={query}
          filter={timeseriesFilter}
          values={timeseriesFilter.metadata}
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
