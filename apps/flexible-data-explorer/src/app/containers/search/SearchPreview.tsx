import React from 'react';

import styled from 'styled-components';

import { RecentlyViewedList } from '../lists/recentlyViewed/RecentlyViewedList';

interface Props {
  onSelectionClick?: () => void;
}
export const SearchPreview: React.FC<Props> = React.memo(
  ({ onSelectionClick }) => {
    return (
      <Container>
        <RecentlyViewedList onSelectionClick={onSelectionClick} hideShadow />
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
