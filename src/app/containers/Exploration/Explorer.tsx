import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { FilePage } from 'app/containers/File/FilePage';
import { ResourceSelectorProvider } from 'lib/context/ResourceSelectorContext';
import { AssetPage } from 'app/containers/Asset/AssetPage';
import { SequencePage } from 'app/containers/Sequence/SequencePage';
import { TimeseriesPage } from 'app/containers/Timeseries/TimeseriesPage';
import { EventPage } from 'app/containers/Event/EventPage';
import styled from 'styled-components';
import { SearchResultsPage } from './SearchResultsPage';
import SearchRedirect from './SearchRedirect';

const AppWrapper = styled.div`
  margin-left: 16px;
  margin-right: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const Explorer = () => {
  const { path } = useRouteMatch();
  return (
    <AppWrapper>
      <ResourceSelectorProvider>
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
      </ResourceSelectorProvider>
    </AppWrapper>
  );
};
