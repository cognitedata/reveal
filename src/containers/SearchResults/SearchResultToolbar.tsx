import React from 'react';
import { FilesSyntaxButton, ResultCount, SpacedRow } from 'components';
import { ResourceType } from 'types';
import styled from 'styled-components/macro';

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
  <StyledSpacedRow style={style}>
    {showCount && (
      <ResultCount
        type={type}
        filter={filter}
        api={api}
        query={query}
        count={count}
      />
    )}
    {type === 'document' && (
      <>
        <VerticalDivider />
        <FilesSyntaxButton />
      </>
    )}
    {children}
  </StyledSpacedRow>
);

const VerticalDivider = styled.div`
  width: 1px;
  height: 16px;
  background-color: var(--cogs-border--muted);
  margin: 0 8px 0 2px;
`;

const StyledSpacedRow = styled(SpacedRow)`
  align-items: center;
`;
