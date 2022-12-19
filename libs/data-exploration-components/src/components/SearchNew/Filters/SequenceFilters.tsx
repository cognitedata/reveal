import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { MetadataFilterV2 } from './MetadataFilter/MetadataFilter';
import { BaseFilterCollapse } from './BaseFilterCollapse/BaseFilterCollapse';
import { transformNewFilterToOldFilter } from '@data-exploration-components/domain/transformers';
import { InternalSequenceFilters } from '@data-exploration-components/domain/sequence';

export const SequenceFilters = ({
  filter,
  setFilter,
  ...rest
}: {
  filter: InternalSequenceFilters;
  setFilter: (newFilter: InternalSequenceFilters) => void;
}) => {
  const { data: items = [] } = useList<any>('sequences', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <BaseFilterCollapse.Panel title="Sequences" {...rest}>
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
  );
};
