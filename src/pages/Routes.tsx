import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { PageTitle } from '@cognite/cdf-utilities';
import SearchPage from 'pages/SearchPage';
import ResultsOverview from 'pages/ResultsOverview';
import FileOverview from 'pages/FileOverview';
import Options from 'pages/Options';
import LandingPage from 'pages/LandingPage';
import GroupsRequired from 'components/GroupsRequired';
import Breadcrumbs from 'components/Breadcrumbs';
import { PageWrapper } from 'components/Common';

const PDF_FILTER = {
  files: {
    filter: {
      mimeType: 'application/pdf',
    },
  },
};

const defaultBreadcrumbs = [
  { title: 'Interactive engineering diagrams', path: '/pnid_parsing_new' },
];

const flowBreadcrumbs = {
  title: 'Contextualize engineering diagrams',
};

const getBreadcrumbs = () => {
  if (window.location.pathname.includes('pipeline'))
    return [...defaultBreadcrumbs, flowBreadcrumbs];
  return defaultBreadcrumbs;
};
export default function Routes() {
  const match = useRouteMatch<{ tenant: string }>();

  return (
    <>
      <Breadcrumbs breadcrumbs={getBreadcrumbs()} />
      <PageWrapper>
        <GroupsRequired>
          <Switch>
            <Route
              exact
              path={`${match.path}`}
              render={() => (
                <div>
                  <PageTitle title="Interactive engineering diagrams" />
                  <LandingPage />
                </div>
              )}
            />
            <Route
              exact
              path={`${match.path}/pipeline`}
              render={() => (
                <div>
                  <PageTitle title="Contextualize engineering diagrams" />
                  <SearchPage
                    type="files"
                    secondaryType="P&ID"
                    key="fileSearch"
                    defaultFilters={PDF_FILTER}
                  />
                </div>
              )}
            />
            <Route
              exact
              path={`${match.path}/pipeline/:filesDataKitId`}
              render={() => (
                <div>
                  <PageTitle title="Contextualize engineering diagrams" />
                  <SearchPage
                    type="assets"
                    secondaryType="tags"
                    key="assetSearch"
                  />
                </div>
              )}
            />
            <Route
              exact
              path={`${match.path}/pipeline/:filesDataKitId/:assetsDataKitId`}
              render={() => (
                <div>
                  <PageTitle title="Contextualize engineering diagrams" />
                  <Options />
                </div>
              )}
            />
            <Route
              exact
              path={`${match.path}/pipeline/:filesDataKitId/:assetsDataKitId/:optionsId`}
              render={() => (
                <div>
                  <PageTitle title="Contextualize engineering diagrams" />
                  <ResultsOverview />
                </div>
              )}
            />
            <Route
              exact
              path={`${match.path}/pipeline/:filesDataKitId/:assetsDataKitId/:optionsId/pnid/:fileId`}
              render={() => (
                <div>
                  <PageTitle title="Contextualize engineering diagrams" />
                  <FileOverview />
                </div>
              )}
            />
          </Switch>
        </GroupsRequired>
      </PageWrapper>
    </>
  );
}
