import React from 'react';

import { MetadataFilterV2 } from '@cognite/data-exploration';
import { useList } from '@cognite/sdk-react-query-hooks';

import { SPECIFIC_INFO_CONTENT } from '@data-exploration-app/containers/constants';
import { TempMultiSelectFix } from '@data-exploration-app/containers/elements';
import {
  useFilterEmptyState,
  useResetSequenceFilters,
  useSequenceFilters,
} from '@data-exploration-app/store/filter';
import {
  transformNewFilterToOldFilter,
  useSequencesMetadataValuesAggregateQuery,
  useSequencesMetadataKeysAggregateQuery,
} from '@data-exploration-lib/domain-layer';

import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';

export const SequenceFilters = ({ ...rest }) => {
  const [sequenceFilter, setSequenceFilter] = useSequenceFilters();
  const resetSequenceFilters = useResetSequenceFilters();
  const isFiltersEmpty = useFilterEmptyState('sequence');

  const { data: metadataKeys = [] } = useSequencesMetadataKeysAggregateQuery();

  const { data: items = [] } = useList<any>('sequences', {
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
          keys={metadataKeys}
          items={items}
          value={sequenceFilter.metadata}
          setValue={(newMetadata) =>
            setSequenceFilter({
              metadata: newMetadata,
            })
          }
          useAggregateMetadataValues={(key) =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useSequencesMetadataValuesAggregateQuery({ metadataKey: key })
          }
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
