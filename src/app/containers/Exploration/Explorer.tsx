import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { FilePage } from 'app/containers/FilePage';
import { ResourcePreviewProvider } from 'lib/context/ResourcePreviewContext';
import { ResourceSelectorProvider } from 'lib/context/ResourceSelectorContext';
import { AssetPage } from 'app/containers/AssetPage';
import { SequencePage } from 'app/containers/SequencePage';
import { TimeseriesPage } from 'app/containers/TimeseriesPage';
import { EventPage } from 'app/containers/EventPage';
import styled from 'styled-components';
import { SearchResultsPage } from './SearchResultsPage';

const AppWrapper = styled.div`
  margin-left: 16px;
  margin-right: 16px;
  height: 100%;
`;

export const Explorer = () => {
  const match = useRouteMatch();
  return (
    <AppWrapper>
      <ResourceSelectorProvider>
        <ResourcePreviewProvider>
          <Switch>
            <Route path={`${match.path}/file/:fileId`} component={FilePage} />
            <Route
              path={`${match.path}/asset/:assetId`}
              component={AssetPage}
            />
            <Route
              path={`${match.path}/sequence/:sequenceId`}
              component={SequencePage}
            />
            <Route
              path={`${match.path}/timeseries/:timeseriesId`}
              component={TimeseriesPage}
            />
            <Route
              path={`${match.path}/event/:eventId`}
              component={EventPage}
            />
            <Route
              path={`${match.path}/:resourceType?`}
              component={SearchResultsPage}
            />
          </Switch>
        </ResourcePreviewProvider>
      </ResourceSelectorProvider>
    </AppWrapper>
  );
};
