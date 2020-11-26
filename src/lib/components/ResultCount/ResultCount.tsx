import React from 'react';
import { useSearch, useAggregate } from '@cognite/sdk-react-query-hooks';
import { formatNumber } from 'lib/utils/numbers';
import { Body } from '@cognite/cogs.js';
import { getTitle, ResourceType, convertResourceType } from 'lib/types';

type ResultProps = {
  api: 'list' | 'search';
  type: ResourceType;
  filter?: any;
  count?: number;
  query?: string;
  label?: string;
};

export function ResultCount({
  api,
  type,
  filter,
  query,
  count,
  label,
}: ResultProps) {
  const sdkType = convertResourceType(type);
  const { data: search, isFetched: searchDone } = useSearch(
    sdkType,
    query!,
    { limit: 1000 },
    {
      enabled: api === 'search' && query && query.length > 0 && !count,
    }
  );
  const { data: list, isFetched: listDone } = useAggregate(sdkType, filter, {
    enabled: api === 'list' && !count,
  });

  if (count !== undefined) {
    return (
      <Body level={4}>
        {formatNumber(count)}{' '}
        {label || getTitle(type, count !== 1).toLowerCase()}
      </Body>
    );
  }

  switch (api) {
    case 'list': {
      if (listDone && Number.isFinite(list?.count)) {
        return (
          <Body level={4}>
            {formatNumber(list?.count!)}{' '}
            {label || getTitle(type, count !== 1).toLowerCase()}
          </Body>
        );
      }
      return null;
    }
    case 'search': {
      if (searchDone && Number.isFinite(search?.length)) {
        return (
          <Body level={4}>
            {formatNumber(search?.length!)}{' '}
            {label || getTitle(type, count !== 1).toLowerCase()}
          </Body>
        );
      }
      return null;
    }
  }
}
