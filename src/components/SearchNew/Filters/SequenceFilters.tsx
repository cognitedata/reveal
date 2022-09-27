import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { SequenceFilter, InternalId } from '@cognite/sdk';
import { ResetFiltersButton } from './ResetFiltersButton';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';
import { StringFilter } from './StringFilter/StringFilter';
import { DateFilter } from './DateFilter/DateFilter';
import { AdvancedFiltersCollapse } from './AdvancedFiltersCollapse';
import { BaseFilterCollapse } from './BaseFilterCollapse/BaseFilterCollapse';

export const SequenceFilters = ({
  filter,
  setFilter,
  ...rest
}: {
  filter: Required<SequenceFilter>['filter'];
  setFilter: (newFilter: Required<SequenceFilter>['filter']) => void;
}) => {
  const { data: items = [] } = useList('sequences', { filter, limit: 1000 });

  return (
    <BaseFilterCollapse.Panel title="Sequences" {...rest}>
      <ResetFiltersButton setFilter={setFilter} />
      <DataSetFilter
        resourceType="sequence"
        value={filter.dataSetIds}
        setValue={newIds =>
          setFilter({
            ...filter,
            dataSetIds: newIds,
          })
        }
      />
      <StringFilter
        title="External ID"
        value={filter.externalIdPrefix}
        setValue={newExternalId =>
          setFilter({
            ...filter,
            externalIdPrefix: newExternalId,
          })
        }
      />
      <ByAssetFilter
        value={filter.assetSubtreeIds?.map(el => (el as InternalId).id)}
        setValue={newValue =>
          setFilter({
            ...filter,
            assetSubtreeIds: newValue?.map(id => ({ id })),
          })
        }
      />
      <DateFilter
        title="Created Time"
        value={filter.createdTime}
        setValue={newDate =>
          setFilter({
            ...filter,
            createdTime: newDate || undefined,
          })
        }
      />
      <DateFilter
        title="Updated Time"
        value={filter.lastUpdatedTime}
        setValue={newDate =>
          setFilter({
            ...filter,
            lastUpdatedTime: newDate || undefined,
          })
        }
      />
      <AdvancedFiltersCollapse resourceType="sequence" filter={filter}>
        <MetadataFilter
          items={items}
          value={filter.metadata}
          setValue={newMetadata =>
            setFilter({
              ...filter,
              metadata: newMetadata,
            })
          }
        />
      </AdvancedFiltersCollapse>
    </BaseFilterCollapse.Panel>
  );
};
