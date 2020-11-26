import React from 'react';
import {
  SdkResourceType,
  useSearch,
  useAggregate,
} from '@cognite/sdk-react-query-hooks';
import { formatNumber } from 'lib/utils/numbers';
import { Body } from '@cognite/cogs.js';

type ResultProps = {
  api: 'list' | 'search';
  type: SdkResourceType;
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
  label = 'results',
}: ResultProps) {
  const { data: search, isFetched: searchDone } = useSearch(
    type,
    query!,
    { limit: 1000 },
    {
      enabled: api === 'search' && query && query.length > 0 && !count,
    }
  );
  const { data: list, isFetched: listDone } = useAggregate(type, filter, {
    enabled: api === 'list' && !count,
  });

  if (count !== undefined) {
    return (
      <Body level={4}>
        {formatNumber(count)} {label}
      </Body>
    );
  }

  switch (api) {
    case 'list': {
      if (listDone && Number.isFinite(list?.count)) {
        return (
          <Body level={4}>
            {formatNumber(list?.count!)} {label}
          </Body>
        );
      }
      return null;
    }
    case 'search': {
      if (searchDone && Number.isFinite(search?.length)) {
        return (
          <Body level={4}>
            {formatNumber(search?.length!)} {label}
          </Body>
        );
      }
      return null;
    }
  }
}
