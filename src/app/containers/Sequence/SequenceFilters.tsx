import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { SequenceFilter } from '@cognite/sdk';
import { MetadataFilter } from '../../components/Filters/MetadataFilter/MetadataFilter';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';

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
    </BaseFilterCollapse.Panel>
  );
};
