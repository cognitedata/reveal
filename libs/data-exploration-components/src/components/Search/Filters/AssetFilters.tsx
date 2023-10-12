import React from 'react';

import { BaseFilterCollapse } from '@data-exploration/components';
import {
  DateFilterV2,
  LabelFilterV2,
  MetadataFilterV2,
  StringFilterV2,
} from '@data-exploration/containers';

import { useList } from '@cognite/sdk-react-query-hooks';

import {
  COMMON_INFO_CONTENT,
  InternalAssetFilters,
  SPECIFIC_INFO_CONTENT,
  isObjectEmpty,
} from '@data-exploration-lib/core';
import { transformNewFilterToOldFilter } from '@data-exploration-lib/domain-layer';

import { ResourceTypes } from '../../../types';
import {
  ByAssetFilterV2,
  DataSetFilterV2,
  SourceFilter,
} from '../../SearchNew';

import {
  TempCommonMultiSelectFix,
  TempMultiSelectFix,
} from './AdvancedFiltersCollapse';

// TODO(CDFUX-000) allow customization of ordering of filters via props
export const AssetFilters = ({
  filter,
  setFilter,
}: {
  filter: InternalAssetFilters;
  setFilter: (newFilter: InternalAssetFilters) => void;
}) => {
  const resourceType = ResourceTypes.Asset;

  const { data: items = [] } = useList<any>('assets', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

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
  const isFilterEmpty = isObjectEmpty(filter as any);

  const handleResetAssetFilters = () => {
    setFilter({
      ...filter,
      labels: undefined,
      sources: undefined,
      metadata: undefined,
    });
  };

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
            resourceType={resourceType}
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
        title="Assets"
        hideResetButton={isFilterEmpty}
        infoContent={SPECIFIC_INFO_CONTENT}
        onResetClick={handleResetAssetFilters}
      >
        <TempMultiSelectFix>
          <LabelFilterV2
            resourceType="asset"
            value={filter.labels}
            setValue={(newFilters) =>
              setFilter({
                ...filter,
                labels: newFilters,
              })
            }
            addNilOption
          />

          <SourceFilter
            items={items}
            value={filter.sources}
            onChange={(newSources) =>
              setFilter({ ...filter, sources: newSources })
            }
            isAdvancedFiltersEnabled={false}
          />

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
        </TempMultiSelectFix>
      </BaseFilterCollapse.Panel>
    </BaseFilterCollapse>
  );
};
