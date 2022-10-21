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
  style,
}: {
  api: 'list' | 'search';
  type: ResourceType;
  filter?: any;
  query?: string;
  children?: React.ReactNode;
  count?: number;
  showCount?: boolean;
  style?: React.CSSProperties;
}) => (
  <SpacedRow style={style}>
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
