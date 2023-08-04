import React from 'react';

import styled from 'styled-components';

import { SearchPreviewActions } from './SearchPreviewActions';
import { SearchPreviewRecentlyViewed } from './SearchPreviewRecentlyViewed';

interface Props {
  query?: string;
  onSelectionClick?: () => void;
}
export const SearchPreview: React.FC<Props> = React.memo(
  ({ query, onSelectionClick }) => {
    if (query) {
      return (
        <Container>
          <SearchPreviewActions
            query={query}
            onSelectionClick={onSelectionClick}
          />
        </Container>
      );
    }

    return (
      <Container>
        <SearchPreviewRecentlyViewed onSelectionClick={onSelectionClick} />
      </Container>
    );
  }
);

const Container = styled.div`
  width: 100%;
  /* height: 100px; */
  background-color: white;
  position: relative;
  top: -1px;
  /* padding: 16px; */
  padding-top: 0px;
  border-top: none;

  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
`;
