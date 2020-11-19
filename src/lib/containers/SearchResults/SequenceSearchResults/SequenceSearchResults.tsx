import React from 'react';
import { SequenceFilter, Sequence } from '@cognite/sdk';
import { SearchResultToolbar } from 'lib/containers/SearchResults';
import { SelectableItemsProps } from 'lib/CommonProps';
import { SearchResultLoader } from 'lib';
import { SequenceTable } from 'lib/containers/Sequences';

export const SequenceSearchResults = ({
  query = '',
  filter = {},
  items,
  onClick,
  ...selectionProps
}: {
  query?: string;
  filter?: Required<SequenceFilter>['filter'];
  items?: Sequence[];
  onClick: (item: Sequence) => void;
} & SelectableItemsProps) => {
  return (
    <>
      <SearchResultToolbar
        api={query.length > 0 ? 'search' : 'list'}
        type="sequences"
        filter={filter}
        query={query}
        count={items ? items.length : undefined}
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
            data={items || props.data}
            onRowClick={sequence => onClick(sequence)}
          />
        )}
      </SearchResultLoader>
    </>
  );
};
