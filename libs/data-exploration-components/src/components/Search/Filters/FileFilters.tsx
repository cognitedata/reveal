import React from 'react';

import { BaseFilterCollapse } from '@data-exploration/components';
import {
  AggregatedFilterV2,
  DateFilterV2,
  LabelFilterV2,
  MetadataFilterV2,
  StringFilterV2,
} from '@data-exploration/containers';

import { useList } from '@cognite/sdk-react-query-hooks';

import {
  COMMON_INFO_CONTENT,
  InternalFilesFilters,
  isObjectEmpty,
  SPECIFIC_INFO_CONTENT,
} from '@data-exploration-lib/core';
import { transformNewFilterToOldFilter } from '@data-exploration-lib/domain-layer';

import { ResourceTypes } from '../../../types';
import { ByAssetFilterV2, DataSetFilterV2 } from '../../SearchNew';

import { TempCommonMultiSelectFix } from './AdvancedFiltersCollapse';

export const FileFilters = ({
  filter,
  setFilter,
}: {
  filter: InternalFilesFilters;
  setFilter: (newFilter: InternalFilesFilters) => void;
}) => {
  const resourceType = ResourceTypes.File;
  const { data: items = [] } = useList<any>('files', {
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

  const handleResetFileFilters = () => {
    setFilter({
      ...filter,
      labels: undefined,
      mimeType: undefined,
      metadata: undefined,
      sourceModifiedTime: undefined,
      uploadedTime: undefined,
      directoryPrefix: undefined,
      source: undefined,
      sourceCreatedTime: undefined,
    });
  };

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
        title="Files"
        hideResetButton={isFilterEmpty}
        onResetClick={handleResetFileFilters}
        infoContent={SPECIFIC_INFO_CONTENT}
      >
        <AggregatedFilterV2
          items={items}
          aggregator="mimeType"
          title="Mime type"
          value={filter.mimeType}
          setValue={(newValue) => setFilter({ ...filter, mimeType: newValue })}
        />
        <DateFilterV2
          title="Source Modified Time"
          value={filter.sourceModifiedTime}
          setValue={(newDate) =>
            setFilter({
              ...filter,
              sourceModifiedTime: newDate || undefined,
            })
          }
        />
        <LabelFilterV2
          resourceType="file"
          value={filter.labels}
          setValue={(newFilters) =>
            setFilter({
              ...filter,
              labels: newFilters,
            })
          }
        />

        <DateFilterV2
          title="Uploaded Time"
          value={filter.uploadedTime}
          setValue={(newDate) =>
            setFilter({
              ...filter,
              uploadedTime: newDate || undefined,
            })
          }
        />
        <StringFilterV2
          title="Directory prefix"
          value={(filter as any).directoryPrefix}
          setValue={(newPrefix) =>
            setFilter({
              ...filter,
              // @ts-ignore
              directoryPrefix: newPrefix,
            })
          }
        />
        <AggregatedFilterV2
          title="Source"
          items={items}
          aggregator="source"
          value={filter.source}
          setValue={(newSource) =>
            setFilter({
              ...filter,
              source: newSource,
            })
          }
        />

        <DateFilterV2
          title="Source Created Time"
          value={filter.sourceCreatedTime}
          setValue={(newDate) =>
            setFilter({
              ...filter,
              sourceCreatedTime: newDate || undefined,
            })
          }
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
      </BaseFilterCollapse.Panel>
    </BaseFilterCollapse>
  );
};
