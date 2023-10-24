import React from 'react';

import { SpacedRow } from '@data-exploration/components';
import styled from 'styled-components/macro';

export const SearchResultToolbar = ({
  children,
  showCount,
  resultCount,
  style,
}: {
  children?: React.ReactNode;
  showCount?: boolean;
  resultCount?: React.ReactNode;
  style?: React.CSSProperties;
}) => {
  return (
    <StyledSpacedRow style={style}>
      {showCount && <>{resultCount}</>}
      {children}
    </StyledSpacedRow>
  );
};

const StyledSpacedRow = styled(SpacedRow)`
  // We need 'important' here to keep divider centered.
  align-items: center !important;
  padding-bottom: 0 !important;
`;
