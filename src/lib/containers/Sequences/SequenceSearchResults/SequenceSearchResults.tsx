import React, { useContext } from 'react';
import { SequenceSearchFilter, SequenceFilter, Sequence } from '@cognite/sdk';
import { ResourceSelectionContext, useResourcePreview } from 'lib/context';
import { SearchResultTable } from 'lib/components/Search/SearchPageTable';
import { SearchResultToolbar } from 'lib/containers/SearchResults';

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
    <>
      <SearchResultToolbar
        api={query.length > 0 ? 'search' : 'list'}
        type="sequences"
        filter={sequenceFilter}
        query={query}
      />
      <SearchResultTable<Sequence>
        api="sequences"
        filter={sequenceFilter}
        query={query}
        onRowClick={sequence =>
          openPreview({ item: { id: sequence.id, type: 'sequence' } })
        }
      />
    </>
  );
};
