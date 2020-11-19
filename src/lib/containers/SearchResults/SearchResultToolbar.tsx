import React from 'react';
import styled from 'styled-components';
import { SdkResourceType } from '@cognite/sdk-react-query-hooks';
import { ResultCount, SpacedRow } from 'lib';

export const SearchResultToolbar = ({
  api,
  type,
  filter,
  query,
  children,
  count,
}: {
  api: 'list' | 'search';
  type: SdkResourceType;
  filter?: any;
  query?: string;
  children?: React.ReactNode;
  count?: number;
}) => {
  return (
    <ToolbarRow>
      <ResultCount
        type={type}
        filter={filter}
        api={api}
        query={query}
        count={count}
      />
      <div className="spacer" />
      {children}
    </ToolbarRow>
  );
};

const ToolbarRow = styled(SpacedRow)`
  align-items: center;
  padding: 5px 0;
  height: 60px;
`;
