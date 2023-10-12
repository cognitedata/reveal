import React from 'react';

import { BaseFilterCollapse } from '@data-exploration/components';
import {
  DateFilterV2,
  IsStepFilter,
  IsStringFilter,
  MetadataFilterV2,
  StringFilterV2,
} from '@data-exploration/containers';

import {
  COMMON_INFO_CONTENT,
  InternalTimeseriesFilters,
  isObjectEmpty,
  SPECIFIC_INFO_CONTENT,
} from '@data-exploration-lib/core';
import {
  useTimeseriesList,
  useTimeseriesMetadataKeysAggregateQuery,
} from '@data-exploration-lib/domain-layer';

import { useAdvancedFiltersEnabled } from '../../../hooks';
import { getTimeseriesFilterUnit } from '../../../utils';
import {
  AggregatedMultiselectFilter,
  ByAssetFilterV2,
  DataSetFilterV2,
} from '../../SearchNew';

import { TempCommonMultiSelectFix } from './AdvancedFiltersCollapse';
import { AggregatedFilter } from './AggregatedFilter/AggregatedFilter';

export const TimeseriesFilters = ({
  filter,
  setFilter,
}: {
  filter: InternalTimeseriesFilters;
  setFilter: (newFilter: InternalTimeseriesFilters) => void;
}) => {
  const isAdvancedFiltersEnabled = useAdvancedFiltersEnabled();

  const { items } = useTimeseriesList(filter, isAdvancedFiltersEnabled);
  const unit = filter.unit;
  const handleResetCommonFilters = () => {
    setFilter({
      ...filter,
      dataSetIds: undefined,
      assetSubtreeIds: undefined,
      createdTime: undefined,
      lastUpdatedTime: undefined,
      externalIdPrefix: undefined,
    });
  };
  const { data: metadata = [] } = useTimeseriesMetadataKeysAggregateQuery();
  const isFilterEmpty = isObjectEmpty(filter as any);

  return (
    <BaseFilterCollapse>
      <BaseFilterCollapse.Panel
        title="Common"
        hideResetButton={isFilterEmpty}
        infoContent={COMMON_INFO_CONTENT}
        onResetClick={handleResetCommonFilters}
      >
        <TempCommonMultiSelectFix>
          <DataSetFilterV2
            resourceType="timeSeries"
            value={filter.dataSetIds}
            setValue={(newValue) =>
              setFilter({ ...filter, dataSetIds: newValue })
            }
          />
          <ByAssetFilterV2
            value={filter.assetSubtreeIds?.map(({ value }) => value)}
            setValue={(newValue) =>
              setFilter({ ...filter, assetSubtreeIds: newValue })
            }
          />
          <DateFilterV2
            title="Created time"
            value={filter.createdTime}
            setValue={(newValue) =>
              setFilter({ ...filter, createdTime: newValue || undefined })
            }
          />
          <DateFilterV2
            title="Updated time"
            value={filter.lastUpdatedTime}
            setValue={(newValue) =>
              setFilter({ ...filter, lastUpdatedTime: newValue || undefined })
            }
          />
          <StringFilterV2
            title="External ID"
            value={filter.externalIdPrefix}
            setValue={(newValue) =>
              setFilter({ ...filter, externalIdPrefix: newValue })
            }
          />
        </TempCommonMultiSelectFix>
      </BaseFilterCollapse.Panel>
      <BaseFilterCollapse.Panel
        title="Timeseries"
        hideResetButton={true}
        infoContent={SPECIFIC_INFO_CONTENT}
        // onResetClick={handleResetAssetFilters}
      >
        <IsStepFilter
          value={filter.isStep}
          onChange={(newValue) => setFilter({ ...filter, isStep: newValue })}
        />
        <IsStringFilter
          value={filter.isString}
          onChange={(newValue) => setFilter({ ...filter, isString: newValue })}
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
          <AggregatedFilter
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
          setValue={(newMetadata) => {
            setFilter({
              ...filter,
              metadata: newMetadata,
            });
          }}
          keys={metadata}
        />
      </BaseFilterCollapse.Panel>
    </BaseFilterCollapse>
  );
};
