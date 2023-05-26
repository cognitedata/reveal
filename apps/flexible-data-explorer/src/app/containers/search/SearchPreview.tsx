import React from 'react';

import styled from 'styled-components';

import { Detail } from '@cognite/cogs.js';
// import useLocalStorageState from 'use-local-storage-state';

const RecentlyViewed = () => {
  // const [recentlySearched] = useLocalStorageState<any>(`recently-viewed`, {
  //   defaultValue: [],
  // });

  return (
    <>
      <Detail>Recently Viewed</Detail>
    </>
  );
};

export const SearchPreview = React.memo(() => {
  // const [recentlySearched] = useLocalStorageState<any>(`recently-viewedddd`, {
  //   defaultValue: [],
  // });

  return (
    <Container>
      <RecentlyViewed />
    </Container>
  );
});

const Container = styled.div`
  width: 100%;
  height: 100px;
  background-color: white;
  position: relative;
  top: -1px;
  padding: 0 16px;
  border-top: none;

  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
`;
