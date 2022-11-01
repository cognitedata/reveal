import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { MetadataFilterV2 } from './MetadataFilter/MetadataFilter';
import { BaseFilterCollapse } from './BaseFilterCollapse/BaseFilterCollapse';
import { transformNewFilterToOldFilter } from 'domain/transformers';
import { InternalSequenceFilters } from 'domain/sequence';

export const SequenceFilters = ({
  filter,
  setFilter,
  ...rest
}: {
  filter: InternalSequenceFilters;
  setFilter: (newFilter: InternalSequenceFilters) => void;
}) => {
  const { data: items = [] } = useList('sequences', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <BaseFilterCollapse.Panel title="Sequences" {...rest}>
      <MetadataFilterV2
        items={items}
        value={filter.metadata}
        setValue={newMetadata =>
          setFilter({
            ...filter,
            metadata: newMetadata,
          })
        }
      />
    </BaseFilterCollapse.Panel>
  );
};
