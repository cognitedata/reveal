import { BaseFilterCollapse } from '@data-exploration/components'; //??

import {
  FilterProps,
  SPECIFIC_INFO_CONTENT,
  hasObjectAnyProperty,
  useTranslation,
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
  const { t } = useTranslation();

  const timeSeriesFilter = filter.timeSeries;
  const isResetButtonVisible = hasObjectAnyProperty(timeSeriesFilter, [
    'metadata',
    'isStep',
    'isString',
    'unit',
  ]);

  return (
    <BaseFilterCollapse.Panel
      title={t('TIMESERIES', 'Time series')}
      hideResetButton={!isResetButtonVisible}
      infoContent={t('SPECIFIC_INFO_CONTENT', SPECIFIC_INFO_CONTENT)}
      onResetClick={() => onResetFilterClick('timeSeries')}
      {...rest}
    >
      <TempMultiSelectFix>
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
        <UnitFilter.Timeseries
          query={query}
          filter={timeSeriesFilter}
          value={timeSeriesFilter.unit}
          onChange={(newUnit) =>
            onFilterChange('timeSeries', { unit: newUnit })
          }
        />
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
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
