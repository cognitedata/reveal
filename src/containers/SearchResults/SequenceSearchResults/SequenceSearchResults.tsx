import React from 'react';
import { SequenceFilter, Sequence } from '@cognite/sdk';
import { SearchResultToolbar } from 'containers/SearchResults';
import {
  SelectableItemsProps,
  TableStateProps,
  DateRangeProps,
  ResourceItem,
  convertResourceType,
} from 'types';
import { SequenceNewTable } from 'containers/Sequences';

import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';
import { EnsureNonEmptyResource } from 'components';
import { useResourceResults } from '../SearchResultLoader';
import { Loader } from '@cognite/cogs.js';

export const SequenceSearchResults = ({
  query = '',
  filter = {},

  relatedResourceType,

  count,
  onClick,
  showCount = false,
}: {
  query?: string;
  filter?: Required<SequenceFilter>['filter'];
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  count?: number;
  showCount?: boolean;
  onClick: (item: Sequence) => void;
} & SelectableItemsProps &
  TableStateProps &
  DateRangeProps) => {
  const api = convertResourceType('sequence');
  const { canFetchMore, fetchMore, isFetched, items } =
    useResourceResults<Sequence>(api, query, filter);

  if (!isFetched) {
    return <Loader />;
  }
  return (
    <EnsureNonEmptyResource api="sequence">
      <SequenceNewTable
        tableHeaders={
          <SearchResultToolbar
            api={query.length > 0 ? 'search' : 'list'}
            type="sequence"
            filter={filter}
            showCount={showCount}
            query={query}
            count={count}
          />
        }
        data={items}
        fetchMore={fetchMore}
        hasNextPage={canFetchMore}
        onRowClick={sequence => onClick(sequence)}
        relatedResourceType={relatedResourceType}
      />
    </EnsureNonEmptyResource>
  );
};
