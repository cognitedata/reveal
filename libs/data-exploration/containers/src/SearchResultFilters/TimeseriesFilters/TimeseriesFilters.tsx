import {
  FilterProps,
  isObjectEmpty,
  SPECIFIC_INFO_CONTENT,
} from '@data-exploration-lib/core';
import { BaseFilterCollapse } from '@data-exploration/components'; //??
import { TempMultiSelectFix } from '../elements';
import {
  IsStepFilter,
  IsStringFilter,
  MetadataFilter,
  UnitFilter,
} from '../../Filters';

export const TimeseriesFilters: React.FC<FilterProps> = ({
  filter,
  onFilterChange,
  onResetFilterClick,
  query,
  ...rest
}) => {
  return (
    <BaseFilterCollapse.Panel
      title="Time series"
      hideResetButton={isObjectEmpty(filter.timeseries as any)}
      infoContent={SPECIFIC_INFO_CONTENT}
      onResetClick={() => onResetFilterClick('timeSeries')}
      {...rest}
    >
      <TempMultiSelectFix>
        <IsStepFilter
          value={filter.timeseries.isStep}
          onChange={(newValue) =>
            onFilterChange('timeSeries', { isStep: newValue })
          }
        />

        <IsStringFilter
          value={filter.timeseries.isString}
          onChange={(newValue) =>
            onFilterChange('timeSeries', { isString: newValue })
          }
        />

        <UnitFilter.Timeseries
          query={query}
          filter={filter.timeseries}
          value={filter.timeseries.unit}
          onChange={(newUnit) =>
            onFilterChange('timeSeries', { unit: newUnit })
          }
        />

        <MetadataFilter.Timeseries
          values={filter.timeseries.metadata}
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
