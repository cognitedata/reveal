import React from 'react';
import { EventFilter, CogniteEvent } from '@cognite/sdk';
import { SearchResultToolbar } from 'lib/containers/SearchResults';
import { SelectableItemsProps } from 'lib/CommonProps';
import { ResourceItem } from 'lib';
import { EventTable } from 'lib/containers/Events';
import { ResultTableLoader } from 'lib/containers/ResultTableLoader';
import { RelatedResourceType } from 'lib/hooks/RelatedResourcesHooks';

export const EventSearchResults = ({
  query = '',
  filter = {},
  onClick,
  showRelatedResources = false,
  relatedResourceType,
  parentResource,
  count,
  ...selectionProps
}: {
  query?: string;
  filter?: EventFilter;
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  count?: number;
  onClick: (item: CogniteEvent) => void;
} & SelectableItemsProps) => {
  return (
    <>
      <SearchResultToolbar
        api={query.length > 0 ? 'search' : 'list'}
        type="event"
        filter={filter}
        query={query}
        count={count}
      />
      <ResultTableLoader<CogniteEvent>
        mode={showRelatedResources ? 'relatedResources' : 'search'}
        type="event"
        filter={filter}
        query={query}
        parentResource={parentResource}
        relatedResourceType={relatedResourceType}
        {...selectionProps}
      >
        {props => (
          <EventTable {...props} onRowClick={event => onClick(event)} />
        )}
      </ResultTableLoader>
    </>
  );
};
