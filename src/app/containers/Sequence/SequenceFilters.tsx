import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import { useResetSequenceFilters, useSequenceFilters } from 'app/store/filter';
import { MetadataFilterV2 } from '@cognite/data-exploration';

export const SequenceFilters = ({ ...rest }) => {
  const [sequenceFilter, setSequenceFilter] = useSequenceFilters();
  const resetSequenceFilters = useResetSequenceFilters();

  const { data: items = [] } = useList('sequences', {
    filter: sequenceFilter,
    limit: 1000,
  });

  return (
    <BaseFilterCollapse.Panel
      title="Sequences"
      onResetClick={resetSequenceFilters}
      {...rest}
    >
      <MetadataFilterV2
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
