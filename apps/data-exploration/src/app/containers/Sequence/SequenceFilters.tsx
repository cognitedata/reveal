import React from 'react';

import { MetadataFilterV2 } from '@data-exploration/containers';

import { useList } from '@cognite/sdk-react-query-hooks';

import {
  transformNewFilterToOldFilter,
  useSequencesMetadataValuesAggregateQuery,
  useSequencesMetadataKeysAggregateQuery,
} from '@data-exploration-lib/domain-layer';

import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import {
  useFilterEmptyState,
  useResetSequenceFilters,
  useSequenceFilters,
} from '../../store';
import { SPECIFIC_INFO_CONTENT } from '../constants';
import { TempMultiSelectFix } from '../elements';

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
