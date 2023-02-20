import { CanvasPage } from '@data-exploration-app/containers/Canvas/CanvasPage';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ResourceSelectorProvider } from '@cognite/data-exploration';
import styled from 'styled-components';
import { ResourceDetailsPage } from '@data-exploration-app/containers/ResourceDetails';
import SearchRedirect from './SearchRedirect';
import { SearchResultsPage } from './SearchResultsPage';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { EXPLORATION } from '@data-exploration-app/constants/metrics';

export const Explorer = () => {
  React.useEffect(() => {
    trackUsage(EXPLORATION.LOAD.APPLICATION);
  }, []);

  return (
    <AppWrapper>
      <ResourceSelectorProvider>
        <Routes>
          <Route path="/search" element={<SearchResultsPage />}>
            <Route path=":resourceType" element={<SearchResultsPage />}>
              <Route path=":id" element={<SearchResultsPage />}>
                <Route path=":tabType" element={<SearchResultsPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="/:resourceType/:id" element={<ResourceDetailsPage />}>
            <Route path=":tabType" element={<ResourceDetailsPage />} />
          </Route>
          <Route path="/canvas" element={<CanvasPage />} />
          <Route path="/" element={<SearchRedirect />} />
        </Routes>
      </ResourceSelectorProvider>
    </AppWrapper>
  );
};

const AppWrapper = styled.div`
  height: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 1;
`;
