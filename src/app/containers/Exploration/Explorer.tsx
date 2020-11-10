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
import SearchRedirect from './SearchRedirect';

const AppWrapper = styled.div`
  margin-left: 16px;
  margin-right: 16px;
  height: 100%;
`;

export const Explorer = () => {
  const { path } = useRouteMatch();
  return (
    <AppWrapper>
      <ResourceSelectorProvider>
        <ResourcePreviewProvider>
          <Switch>
            <Route path={`${path}/file/:id`} component={FilePage} />
            <Route path={`${path}/asset/:id`} component={AssetPage} />
            <Route path={`${path}/sequence/:id`} component={SequencePage} />
            <Route path={`${path}/timeseries/:id`} component={TimeseriesPage} />
            <Route path={`${path}/event/:id`} component={EventPage} />
            <Route exact path={`${path}/`} component={SearchRedirect} />
            <Route
              path={`${path}/search/:resourceType?/:id?`}
              component={SearchResultsPage}
            />
          </Switch>
        </ResourcePreviewProvider>
      </ResourceSelectorProvider>
    </AppWrapper>
  );
};
