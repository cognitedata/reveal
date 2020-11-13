import React from 'react';
import { SequenceFilter, Sequence } from '@cognite/sdk';
import { SearchResultToolbar } from 'lib/containers/SearchResults';
import { SelectableItemsProps } from 'lib/CommonProps';
import { SearchResultLoader } from 'lib';
import { SequenceTable } from 'lib/containers/Sequences';

export const SequenceSearchResults = ({
  query = '',
  filter,
  onClick,
  ...selectionProps
}: {
  query?: string;
  filter: Required<SequenceFilter>['filter'];
  onClick: (item: Sequence) => void;
} & SelectableItemsProps) => {
  return (
    <>
      <SearchResultToolbar
        api={query.length > 0 ? 'search' : 'list'}
        type="sequences"
        filter={filter}
        query={query}
      />
      <SearchResultLoader<Sequence>
        type="sequence"
        filter={filter}
        query={query}
        {...selectionProps}
      >
        {props => (
          <SequenceTable
            {...props}
            onRowClick={sequence => onClick(sequence)}
          />
        )}
      </SearchResultLoader>
    </>
  );
};
