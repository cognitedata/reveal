import React from 'react';
import { Routes, Route } from 'react-router-dom';

import styled from 'styled-components';

import { ResourceSelectorProvider } from '@data-exploration-components/context';

import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import { routes } from '@data-exploration-app/containers/App';
import { AssetPage } from '@data-exploration-app/containers/Asset/AssetPage';
import { CanvasPage } from '@data-exploration-app/containers/Canvas/CanvasPage';
import { EventPage } from '@data-exploration-app/containers/Event/EventPage';
import { FilePage } from '@data-exploration-app/containers/File/FilePage';
import { SequencePage } from '@data-exploration-app/containers/Sequence/SequencePage';
import { ThreeDPage } from '@data-exploration-app/containers/ThreeD/ThreeDPage';
import { TimeseriesPage } from '@data-exploration-app/containers/Timeseries/TimeseriesPage';
import { trackUsage } from '@data-exploration-app/utils/Metrics';

import { useFlagOverlayNavigation } from '../../hooks/flags';

import JourneyRedirect from './JourneyRedirect';
import SearchRedirect from './SearchRedirect';
import { SearchResultsPage } from './SearchResultsPage';

export const Explorer = () => {
  const isDetailsOverlayEnabled = useFlagOverlayNavigation();

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

          <Route path={routes.canvas.path} element={<CanvasPage />} />

          {/* We do not have separate ResourcePage's anymore for the full page resource details. */}
          {/* So we are redirecting any old routes to the new routes with 'journey' search param. */}
          {isDetailsOverlayEnabled ? (
            <Route
              path="/search/:resourceType/:id"
              element={<JourneyRedirect />}
            />
          ) : (
            <>
              <Route path={routes.assetPage.path} element={<AssetPage />} />
              <Route path={routes.assetPageTab.path} element={<AssetPage />} />
              <Route
                path={routes.timeseriesPage.path}
                element={<TimeseriesPage />}
              />
              <Route
                path={routes.timeseriesPageTab.path}
                element={<TimeseriesPage />}
              />
              <Route path={routes.filePage.path} element={<FilePage />} />
              <Route path={routes.filePageTab.path} element={<FilePage />} />

              <Route path={routes.eventPage.path} element={<EventPage />} />
              <Route path={routes.eventPageTab.path} element={<EventPage />} />
              <Route
                path={routes.sequencePage.path}
                element={<SequencePage />}
              />
              <Route
                path={routes.sequencePageTab.path}
                element={<SequencePage />}
              />
            </>
          )}

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
