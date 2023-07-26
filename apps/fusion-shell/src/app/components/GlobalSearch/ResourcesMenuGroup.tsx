import { useSearch } from '@cognite/sdk-react-query-hooks';

import { QUERY_RESULT_LIMIT } from '../../utils/constants';

import ResourceLoadingSkeleton from './ResourceLoadingSkeleton';
import { ResourcesMenuList, ResourcesMenuListProps } from './ResourcesMenuList';

export interface ResourcesMenuGroupProps
  extends Omit<ResourcesMenuListProps, 'items' | 'isFetched'> {
  /** Specify the amount of elements we want to display in the menu group. */
  limit?: number;
}

export interface SearchItem {
  id: number;
  externalId?: string;
  name?: string;
  description?: string;
}

export function ResourcesMenuGroup({
  query,
  type,
  groupLabel,
  allUrl,
  url,
  icon,
  limit = QUERY_RESULT_LIMIT,
  onClose,
}: ResourcesMenuGroupProps) {
  const hasQuery = !!query && query.length > 0;

  const {
    data: items = [],
    isFetched,
    isError,
    isLoading: isResourceLoading,
  } = useSearch<SearchItem>(
    type,
    query,
    {
      limit,
    },
    {
      enabled: hasQuery,
    }
  );

  if (!hasQuery || isError) {
    return null;
  }

  if (isResourceLoading) return <ResourceLoadingSkeleton />;

  return (
    <ResourcesMenuList
      items={items}
      isFetched={isFetched}
      groupLabel={groupLabel}
      allUrl={allUrl}
      url={url}
      icon={icon}
      query={query}
      type={type}
      onClose={onClose}
    />
  );
}
