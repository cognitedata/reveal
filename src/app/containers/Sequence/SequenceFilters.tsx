import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import { useSequenceFilters } from 'app/store/filter';
import { MetadataFilter } from '@cognite/data-exploration';

export const SequenceFilters = ({ ...rest }) => {
  const [sequenceFilter, setSequenceFilter] = useSequenceFilters();

  const { data: items = [] } = useList('sequences', {
    filter: sequenceFilter,
    limit: 1000,
  });

  return (
    <BaseFilterCollapse.Panel title="Sequences" {...rest}>
      <MetadataFilter
        items={items}
        value={sequenceFilter.metadata}
        setValue={newMetadata =>
          setSequenceFilter({
            metadata: newMetadata,
          })
        }
      />
    </BaseFilterCollapse.Panel>
  );
};
