import React from 'react';
import { FilesSyntaxButton, SpacedRow } from 'components';
import { ResourceType } from 'types';
import styled from 'styled-components/macro';

export const SearchResultToolbar = ({
  type,
  children,
  showCount,
  resultCount,
  style,
  enableAdvancedFilters,
}: {
  type: ResourceType;
  children?: React.ReactNode;
  showCount?: boolean;
  resultCount?: React.ReactNode;
  style?: React.CSSProperties;
  enableAdvancedFilters?: boolean;
}) => {
  return (
    <StyledSpacedRow style={style}>
      {showCount && <>{resultCount}</>}
      {/* Show documents api syntax tips button if advanced filters are enabled */}
      {enableAdvancedFilters && type === 'file' && (
        <>
          <VerticalDivider />
          <FilesSyntaxButton />
        </>
      )}
      {children}
    </StyledSpacedRow>
  );
};

const VerticalDivider = styled.div`
  width: 1px;
  height: 16px;
  background-color: var(--cogs-border--muted);
  margin: 0 8px 0 2px;
`;

const StyledSpacedRow = styled(SpacedRow)`
  align-items: center;
  padding-bottom: 0;
`;
