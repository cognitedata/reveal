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
}: {
  type: ResourceType;
  children?: React.ReactNode;
  showCount?: boolean;
  resultCount?: React.ReactNode;
  style?: React.CSSProperties;
}) => {
  return (
    <StyledSpacedRow style={style}>
      {showCount && <>{resultCount}</>}
      {type === 'document' && (
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
