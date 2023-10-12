import React from 'react';

import { BaseFilterCollapse } from '@data-exploration/components';
import {
  DateFilterV2,
  MetadataFilterV2,
  StringFilterV2,
} from '@data-exploration/containers';

import { useList } from '@cognite/sdk-react-query-hooks';

import {
  COMMON_INFO_CONTENT,
  InternalEventsFilters,
  isObjectEmpty,
  SPECIFIC_INFO_CONTENT,
} from '@data-exploration-lib/core';
import { transformNewFilterToOldFilter } from '@data-exploration-lib/domain-layer';

import {
  AggregatedEventFilterV2,
  ByAssetFilterV2,
  DataSetFilterV2,
  SourceFilter,
} from '../../SearchNew';

import { TempCommonMultiSelectFix } from './AdvancedFiltersCollapse';

export const EventFilters = ({
  filter,
  setFilter,
}: {
  filter: InternalEventsFilters;
  setFilter: (newFilter: InternalEventsFilters) => void;
}) => {
  const { data: items = [] } = useList<any>('events', {
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
            resourceType="event"
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
        title="Event"
        hideResetButton={true}
        infoContent={SPECIFIC_INFO_CONTENT}
        // onResetClick={handleResetAssetFilters}
      >
        <AggregatedEventFilterV2
          field="type"
          filter={filter}
          setValue={(newValue) => {
            setFilter({ ...filter, type: newValue });
          }}
          title="Type"
          value={filter.type || []}
          isMulti={false}
        />
        <DateFilterV2
          title="Start time"
          value={filter.startTime}
          setValue={(newDate) =>
            setFilter({
              ...filter,
              startTime: newDate || undefined,
            })
          }
        />
        <DateFilterV2
          title="End time"
          enableNull
          value={
            filter.endTime && 'isNull' in filter.endTime ? null : filter.endTime
          }
          setValue={(newDate) =>
            setFilter({
              ...filter,
              endTime:
                newDate === null ? { isNull: true } : newDate || undefined,
            })
          }
        />
        <AggregatedEventFilterV2
          field="subtype"
          filter={filter}
          setValue={(newValue) => {
            setFilter({ ...filter, subtype: newValue });
          }}
          title="Sub-type"
          value={filter.subtype || []}
          isMulti={false}
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
            setFilter({ ...filter, metadata: newMetadata })
          }
        />
      </BaseFilterCollapse.Panel>
    </BaseFilterCollapse>
  );
};
