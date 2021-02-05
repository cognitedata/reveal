import React from 'react';
import { SequenceFilter, Sequence } from '@cognite/sdk';
import { SearchResultToolbar } from 'containers/SearchResults';
import {
  SelectableItemsProps,
  TableStateProps,
  DateRangeProps,
} from 'CommonProps';
import { ResourceItem } from 'types';
import { SequenceTable } from 'containers/Sequences';
import { ResultTableLoader } from 'containers/ResultTableLoader';
import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';

export const SequenceSearchResults = ({
  query = '',
  filter = {},
  showRelatedResources = false,
  relatedResourceType,
  parentResource,
  count,
  onClick,
  ...extraProps
}: {
  query?: string;
  filter?: Required<SequenceFilter>['filter'];
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  count?: number;
  onClick: (item: Sequence) => void;
} & SelectableItemsProps &
  TableStateProps &
  DateRangeProps) => (
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
      {...extraProps}
    >
      {props => (
        <SequenceTable {...props} onRowClick={sequence => onClick(sequence)} />
      )}
    </ResultTableLoader>
  </>
);
