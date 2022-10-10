import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { SequenceFilter } from '@cognite/sdk';
import { MetadataFilterV2 } from './MetadataFilter/MetadataFilter';
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
