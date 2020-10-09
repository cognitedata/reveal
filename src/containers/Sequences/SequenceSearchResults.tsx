import React, { useContext } from 'react';
import { ResourceTable } from 'components/Common';
import { SequenceSearchFilter, SequenceFilter, Sequence } from '@cognite/sdk';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { useResourcePreview } from 'context/ResourcePreviewContext';

export const buildSequencesFilterQuery = (
  filter: SequenceFilter['filter'],
  query: string | undefined
): SequenceSearchFilter => {
  return {
    ...(query &&
      query.length > 0 && {
        search: {
          name: query,
        },
      }),
    filter,
  };
};

export const SequenceSearchResults = ({ query = '' }: { query?: string }) => {
  const { sequenceFilter } = useContext(ResourceSelectionContext);
  const { openPreview } = useResourcePreview();

  return (
    <ResourceTable<Sequence>
      api="sequences"
      filter={sequenceFilter}
      query={query}
      onRowClick={sequence =>
        openPreview({ item: { id: sequence.id, type: 'sequence' } })
      }
    />
  );
};
