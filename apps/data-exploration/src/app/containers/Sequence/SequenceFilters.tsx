import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import {
  useFilterEmptyState,
  useResetSequenceFilters,
  useSequenceFilters,
} from '@data-exploration-app/store/filter';
import {
  MetadataFilterV2,
  transformNewFilterToOldFilter,
} from '@cognite/data-exploration';
import { TempMultiSelectFix } from '@data-exploration-app/containers/elements';
import { SPECIFIC_INFO_CONTENT } from '@data-exploration-app/containers/constants';

export const SequenceFilters = ({ ...rest }) => {
  const [sequenceFilter, setSequenceFilter] = useSequenceFilters();
  const resetSequenceFilters = useResetSequenceFilters();
  const isFiltersEmpty = useFilterEmptyState('sequence');

  const { data: items = [] } = useList('sequences', {
    filter: transformNewFilterToOldFilter(sequenceFilter),
    limit: 1000,
  });

  return (
    <BaseFilterCollapse.Panel
      title="Sequences"
      infoContent={SPECIFIC_INFO_CONTENT}
      hideResetButton={isFiltersEmpty}
      onResetClick={resetSequenceFilters}
      {...rest}
    >
      <TempMultiSelectFix>
        <MetadataFilterV2
          items={items}
          value={sequenceFilter.metadata}
          setValue={(newMetadata) =>
            setSequenceFilter({
              metadata: newMetadata,
            })
          }
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
