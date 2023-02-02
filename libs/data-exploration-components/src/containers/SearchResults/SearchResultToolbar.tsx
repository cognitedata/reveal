import React from 'react';
import {
  FilesSyntaxButton,
  SpacedRow,
} from '@data-exploration-components/components';
import { ResourceType } from '@data-exploration-components/types';
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
  margin: 0 8px 0 0;
`;

const StyledSpacedRow = styled(SpacedRow)`
  // We need 'important' here to keep divider centered.
  align-items: center !important;
  padding-bottom: 0 !important;
`;
