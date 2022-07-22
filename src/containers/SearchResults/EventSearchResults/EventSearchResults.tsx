import React from 'react';
import { EventFilter, CogniteEvent } from '@cognite/sdk';
import { SearchResultToolbar } from 'containers/SearchResults';
import {
  SelectableItemsProps,
  TableStateProps,
  DateRangeProps,
} from 'CommonProps';
import { ResourceItem } from 'types';
import { EventTable } from 'containers/Events';
import { ResultTableLoader } from 'containers/ResultTableLoader';
import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';
import { EnsureNonEmptyResource } from 'components';

export const EventSearchResults = ({
  query = '',
  filter = {},
  onClick,
  showRelatedResources = false,
  relatedResourceType,
  parentResource,
  count,
  showCount = false,
  ...extraProps
}: {
  query?: string;
  filter?: EventFilter;
  showCount?: boolean;
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  count?: number;
  onClick: (item: CogniteEvent) => void;
} & SelectableItemsProps &
  TableStateProps &
  DateRangeProps) => (
  <>
    {showCount && (
      <SearchResultToolbar
        showCount={showCount}
        api={query.length > 0 ? 'search' : 'list'}
        type="event"
        filter={filter}
        query={query}
        count={count}
      />
    )}
    <EnsureNonEmptyResource api="event">
      <ResultTableLoader<CogniteEvent>
        mode={showRelatedResources ? 'relatedResources' : 'search'}
        type="event"
        filter={filter}
        query={query}
        parentResource={parentResource}
        relatedResourceType={relatedResourceType}
        {...extraProps}
      >
        {props => (
          <EventTable
            {...props}
            onRowClick={event => onClick(event)}
            relatedResourceType={relatedResourceType}
          />
        )}
      </ResultTableLoader>
    </EnsureNonEmptyResource>
  </>
);
