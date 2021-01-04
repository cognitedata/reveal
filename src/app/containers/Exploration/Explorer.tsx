import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { ResourceSelectorProvider } from 'lib/context/ResourceSelectorContext';
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
  const { path } = useRouteMatch();

  return (
    <>
      <AppWrapper>
        <ResourceSelectorProvider>
          <Switch>
            <Route
              path={`${path}/search/:resourceType?/:id?`}
              component={SearchResultsPage}
            />
            <Route
              path={`${path}/:resourceType/:id`}
              component={ResourceDetailsPage}
            />
            <Route exact path={`${path}/`} component={SearchRedirect} />
          </Switch>
        </ResourceSelectorProvider>
      </AppWrapper>
    </>
  );
};
