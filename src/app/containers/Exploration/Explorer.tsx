import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ResourceSelectorProvider } from '@cognite/data-exploration';
import styled from 'styled-components';
import { ResourceDetailsPage } from 'app/containers/ResourceDetails';
import SearchRedirect from './SearchRedirect';
import { SearchResultsPage } from './SearchResultsPage';

const AppWrapper = styled.div`
  margin-left: 16px;
  margin-right: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const Explorer = () => {
  return (
    <>
      <AppWrapper>
        <ResourceSelectorProvider>
          <Routes>
            <Route path="/search/:resourceType" element={<SearchResultsPage />}>
              <Route path=":id" element={<SearchResultsPage />}>
                <Route path=":tabType" element={<SearchResultsPage />} />
              </Route>
            </Route>
            <Route
              path="/:resourceType/:id/*"
              element={<ResourceDetailsPage />}
            />
            <Route path="/" element={<SearchRedirect />} />
          </Routes>
        </ResourceSelectorProvider>
      </AppWrapper>
    </>
  );
};
