import {
  FilterProps,
  isObjectEmpty,
  SPECIFIC_INFO_CONTENT,
} from '@data-exploration-lib/core';
import { BaseFilterCollapse } from '@data-exploration/components'; //??
import { TempMultiSelectFix } from '../elements';
import { IsStepFilter, IsStringFilter, UnitFilter } from '../../../src/Filters';

export const TimeseriesFilters: React.FC<FilterProps> = ({
  filter,
  onFilterChange,
  onResetFilterClick,
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
          value={filter.timeseries.unit}
          onChange={(newUnit) =>
            onFilterChange('timeSeries', { unit: newUnit })
          }
        />

        {/* ///////////////// */}
        {/* <MetadataFilterV2
          items={items}
          keys={metadataKeys}
          value={filter.asset.metadata}
          setValue={(newMetadata) =>
            onFilterChange('asset', {
              metadata: newMetadata,
            })
          }
          useAggregateMetadataValues={useAssetsMetadataValuesAggregateQuery}
        /> */}
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
