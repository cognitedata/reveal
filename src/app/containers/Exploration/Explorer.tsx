import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ResourceSelectorProvider } from '@cognite/data-exploration';
import styled from 'styled-components';
import { ResourceDetailsPage } from 'app/containers/ResourceDetails';
import SearchRedirect from './SearchRedirect';
import { SearchResultsPage } from './SearchResultsPage';
import { useFlagFilter } from 'app/hooks';

export const Explorer = () => {
  const isFilterEnabled = useFlagFilter();
  return (
    <AppWrapper isFilterEnabled={isFilterEnabled}>
      <ResourceSelectorProvider>
        <Routes>
          <Route path="/search/:resourceType" element={<SearchResultsPage />}>
            <Route path=":id" element={<SearchResultsPage />}>
              <Route path=":tabType" element={<SearchResultsPage />} />
            </Route>
          </Route>
          <Route path="/:resourceType/:id" element={<ResourceDetailsPage />}>
            <Route path=":tabType" element={<ResourceDetailsPage />} />
          </Route>
          <Route path="/" element={<SearchRedirect />} />
        </Routes>
      </ResourceSelectorProvider>
    </AppWrapper>
  );
};

const AppWrapper = styled.div<{ isFilterEnabled?: boolean }>`
  height: 100%;
  max-width: 100vw;
  padding-left: ${props => (props.isFilterEnabled ? '0px' : '16px')};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 1;
`;
