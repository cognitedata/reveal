import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { ResetFiltersButton } from './ResetFiltersButton';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';
import { StringFilter } from './StringFilter/StringFilter';
import { DateFilter } from './DateFilter/DateFilter';
import { AdvancedFiltersCollapse } from './AdvancedFiltersCollapse';
import { InternalSequenceFilters } from 'domain/sequence';
import { transformNewFilterToOldFilter } from 'domain/transformers';

export const SequenceFilters = ({
  filter,
  setFilter,
}: {
  filter: InternalSequenceFilters;
  setFilter: (newFilter: InternalSequenceFilters) => void;
}) => {
  const { data: items = [] } = useList('sequences', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <div>
      <ResetFiltersButton setFilter={setFilter} />
      <DataSetFilter
        resourceType="sequence"
        value={filter.dataSetIds?.map(({ value }) => ({ id: value }))}
        setValue={newIds =>
          setFilter({
            ...filter,
            dataSetIds: newIds?.map(({ id }: any) => ({ value: id })),
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
        value={filter.assetSubtreeIds?.map(({ value }) => value)}
        setValue={newValue =>
          setFilter({
            ...filter,
            assetSubtreeIds: newValue?.map(id => ({ value: id })),
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
    </div>
  );
};
