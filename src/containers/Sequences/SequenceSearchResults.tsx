import React, { useContext } from 'react';
import { SequenceTable } from 'components/Common';
import { SequenceSearchFilter, SequenceFilter } from 'cognite-sdk-v3';
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
    <SequenceTable
      onSequenceClicked={sequence =>
        openPreview({ item: { id: sequence.id, type: 'sequence' } })
      }
      query={query}
      filter={sequenceFilter}
    />
  );
};
