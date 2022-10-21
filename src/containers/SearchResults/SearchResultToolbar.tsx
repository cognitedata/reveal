import React from 'react';
import { ResultCount, SpacedRow } from 'components';
import { ResourceType } from 'types';

export const SearchResultToolbar = ({
  api,
  type,
  filter,
  query,
  children,
  count,
  showCount,
  className,
}: {
  api: 'list' | 'search';
  type: ResourceType;
  filter?: any;
  query?: string;
  children?: React.ReactNode;
  count?: number;
  showCount?: boolean;
  className?: string;
}) => (
  <SpacedRow className={className}>
    {showCount && (
      <ResultCount
        type={type}
        filter={filter}
        api={api}
        query={query}
        count={count}
      />
    )}
    <div className="spacer" />
    {children}
  </SpacedRow>
);
