import React from 'react';
import { EventFilter, CogniteEvent } from '@cognite/sdk';
import { SearchResultToolbar } from 'containers/SearchResults';
import { ResourceItem, convertResourceType } from 'types';
import { EventNewTable } from 'containers/Events';

import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';
import { EnsureNonEmptyResource } from 'components';
import { useResourceResults } from '../SearchResultLoader';
import { Loader } from '@cognite/cogs.js';
import { ColumnToggleProps } from 'components/ReactTable';

export const EventSearchResults = ({
  query = '',
  filter = {},
  onClick,
  count,
  showCount = false,
  ...rest
}: {
  query?: string;
  filter?: EventFilter;
  showCount?: boolean;
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  count?: number;
  onClick: (item: CogniteEvent) => void;
} & ColumnToggleProps<CogniteEvent>) => {
  const api = convertResourceType('event');
  const { canFetchMore, fetchMore, isFetched, items } =
    useResourceResults<CogniteEvent>(api, query, filter);

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <EnsureNonEmptyResource api="event">
      <EventNewTable
        tableHeaders={
          <SearchResultToolbar
            api={query.length > 0 ? 'search' : 'list'}
            type="event"
            filter={filter}
            showCount={showCount}
            query={query}
            count={count}
          />
        }
        data={items}
        fetchMore={fetchMore}
        showLoadButton
        hasNextPage={canFetchMore}
        onRowClick={event => onClick(event)}
        {...rest}
      />
    </EnsureNonEmptyResource>
  );
};
