import React from 'react';

import { QUERY_RESULT_LIMIT } from '../../utils/constants';
import { useDataSetSearch } from '../../utils/hooks';

import { ResourcesMenuGroupProps } from './ResourcesMenuGroup';
import { ResourcesMenuList } from './ResourcesMenuList';

export type DatasetMenuGroupProps = Omit<
  ResourcesMenuGroupProps,
  'type' | 'icon' | 'isFetched'
>;

export function DatasetMenuGroup({
  query,
  groupLabel,
  url,
  allUrl,
  limit = QUERY_RESULT_LIMIT,
  onClose,
}: DatasetMenuGroupProps) {
  const hasQuery = !!query && query.length > 0;

  const {
    data: items = [],
    isError,
    isFetched,
  } = useDataSetSearch(query, limit);

  if (!hasQuery || isError) {
    return null;
  }

  return (
    <ResourcesMenuList
      items={items}
      isFetched={isFetched}
      groupLabel={groupLabel}
      url={url}
      allUrl={allUrl}
      type="datasets"
      icon="DataSource"
      query={query}
      onClose={onClose}
    />
  );
}
