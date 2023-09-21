import React from 'react';

import { useList } from '@cognite/sdk-react-query-hooks';

import { OldSequenceFilters } from '@data-exploration-lib/core';
import { transformNewFilterToOldFilter } from '@data-exploration-lib/domain-layer';

import { ResourceTypes } from '../../../types';

import { AdvancedFiltersCollapse } from './AdvancedFiltersCollapse';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { DateFilter } from './DateFilter/DateFilter';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { ResetFiltersButton } from './ResetFiltersButton';
import { StringFilter } from './StringFilter/StringFilter';

export const SequenceFilters = ({
  filter,
  setFilter,
}: {
  filter: OldSequenceFilters;
  setFilter: (newFilter: OldSequenceFilters) => void;
}) => {
  const resourceType = ResourceTypes.Sequence;
  const { data: items = [] } = useList<any>('sequences', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <div>
      <ResetFiltersButton setFilter={setFilter} resourceType={resourceType} />
      <DataSetFilter
        resourceType={resourceType}
        value={filter.dataSetIds?.map(({ value }) => ({ id: value }))}
        setValue={(newIds) =>
          setFilter({
            ...filter,
            dataSetIds: newIds?.map(({ id }: any) => ({ value: id })),
          })
        }
      />
      <StringFilter
        title="External ID"
        value={filter.externalIdPrefix}
        setValue={(newExternalId) =>
          setFilter({
            ...filter,
            externalIdPrefix: newExternalId,
          })
        }
      />
      <ByAssetFilter
        value={filter.assetSubtreeIds?.map(({ value }) => value)}
        setValue={(newValue) =>
          setFilter({
            ...filter,
            assetSubtreeIds: newValue?.map((id) => ({ value: id })),
          })
        }
      />
      <DateFilter
        title="Created Time"
        value={filter.createdTime}
        setValue={(newDate) =>
          setFilter({
            ...filter,
            createdTime: newDate || undefined,
          })
        }
      />
      <DateFilter
        title="Updated Time"
        value={filter.lastUpdatedTime}
        setValue={(newDate) =>
          setFilter({
            ...filter,
            lastUpdatedTime: newDate || undefined,
          })
        }
      />
      <AdvancedFiltersCollapse resourceType={resourceType} filter={filter}>
        <MetadataFilter
          items={items}
          value={filter.metadata}
          setValue={(newMetadata) =>
            setFilter({
              ...filter,
              metadata: newMetadata,
            })
          }
        />
      </AdvancedFiltersCollapse>
    </div>
  );
};
