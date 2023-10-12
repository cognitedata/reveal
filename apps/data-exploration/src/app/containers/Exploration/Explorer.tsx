import React from 'react';
import { Routes, Route } from 'react-router-dom';

import styled from 'styled-components';

import { ResourceSelectorProvider } from '@data-exploration-components/context';

import { EXPLORATION } from '../../constants/metrics';
import { trackUsage } from '../../utils/Metrics';
import { routes } from '../App';
import { ThreeDPage } from '../ThreeD/ThreeDPage';

import JourneyRedirect from './JourneyRedirect';
import SearchRedirect from './SearchRedirect';
import { SearchResultsPage } from './SearchResultsPage';

export const Explorer = () => {
  React.useEffect(() => {
    trackUsage(EXPLORATION.LOAD.APPLICATION);
  }, []);

  return (
    <AppWrapper>
      <ResourceSelectorProvider>
        <Routes>
          <Route
            path={routes.searchRoot.path}
            element={<SearchResultsPage />}
          />

          {/* We do not have separate ResourcePage's anymore for the full page resource details. */}
          {/* So we are redirecting any old routes to the new routes with 'journey' search param. */}
          {/* This is to redirect old full-page resource pages to new journey format */}
          <Route path="/:resourceType/:id" element={<JourneyRedirect />} />
          {/* This is to redirect results from navbar global search to new journey format */}
          <Route
            path="/search/:resourceType/:id"
            element={<JourneyRedirect />}
          />
          <Route path={routes.threeDPage.path} element={<ThreeDPage />} />
          <Route path={routes.threeDPageTab.path} element={<ThreeDPage />} />
          <Route path={routes.root.path} element={<SearchRedirect />} />
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
