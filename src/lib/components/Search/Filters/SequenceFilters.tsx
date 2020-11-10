import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { SequenceFilter, InternalId } from '@cognite/sdk';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';
import { StringFilter } from './StringFilter/StringFilter';

export const SequenceFilters = ({
  filter,
  setFilter,
}: {
  filter: Required<SequenceFilter>['filter'];
  setFilter: (newFilter: Required<SequenceFilter>['filter']) => void;
}) => {
  const { data: items = [] } = useList('sequences', { filter, limit: 1000 });
  return (
    <div>
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
    </div>
  );
};
