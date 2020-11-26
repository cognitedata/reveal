import React from 'react';
import { SequenceFilter, Sequence } from '@cognite/sdk';
import { SearchResultToolbar } from 'lib/containers/SearchResults';
import { SelectableItemsProps } from 'lib/CommonProps';
import { ResourceItem } from 'lib';
import { SequenceTable } from 'lib/containers/Sequences';
import { ResultTableLoader } from 'lib/containers/ResultTableLoader';
import { RelatedResourceType } from 'lib/hooks/RelatedResourcesHooks';

export const SequenceSearchResults = ({
  query = '',
  filter = {},
  showRelatedResources = false,
  relatedResourceType,
  parentResource,
  count,
  onClick,
  ...selectionProps
}: {
  query?: string;
  filter?: Required<SequenceFilter>['filter'];
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  count?: number;
  onClick: (item: Sequence) => void;
} & SelectableItemsProps) => {
  return (
    <>
      <SearchResultToolbar
        api={query.length > 0 ? 'search' : 'list'}
        type="sequence"
        filter={filter}
        query={query}
        count={count}
      />
      <ResultTableLoader<Sequence>
        mode={showRelatedResources ? 'relatedResources' : 'search'}
        type="sequence"
        filter={filter}
        query={query}
        parentResource={parentResource}
        relatedResourceType={relatedResourceType}
        {...selectionProps}
      >
        {props => (
          <SequenceTable
            {...props}
            onRowClick={sequence => onClick(sequence)}
          />
        )}
      </ResultTableLoader>
    </>
  );
};
