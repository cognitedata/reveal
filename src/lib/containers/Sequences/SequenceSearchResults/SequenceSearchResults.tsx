import React from 'react';
import { SequenceSearchFilter, SequenceFilter, Sequence } from '@cognite/sdk';
import { useResourcePreview } from 'lib/context';
import { SearchResultTable } from 'lib/components/Search/SearchPageTable';
import { SearchResultToolbar } from 'lib/containers/SearchResults';
import { SelectableItemsProps } from 'lib/CommonProps';

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

export const SequenceSearchResults = ({
  query = '',
  filter,
  ...selectionProps
}: {
  query?: string;
  filter: Required<SequenceFilter>['filter'];
} & SelectableItemsProps) => {
  const { openPreview } = useResourcePreview();

  return (
    <>
      <SearchResultToolbar
        api={query.length > 0 ? 'search' : 'list'}
        type="sequences"
        filter={filter}
        query={query}
      />
      <SearchResultTable<Sequence>
        api="sequences"
        filter={filter}
        query={query}
        onRowClick={sequence =>
          openPreview({ item: { id: sequence.id, type: 'sequence' } })
        }
        {...selectionProps}
      />
    </>
  );
};
