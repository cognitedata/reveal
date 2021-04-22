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
import StepsList from 'components/StepsList';
import { PageWrapper } from 'components/Common';
import {
  landingPage,
  diagramSelection,
  resourceSelection,
  configPage,
  reviewPage,
  diagramPreview,
} from './paths';

const PDF_FILTER = {
  files: {
    filter: {
      mimeType: 'application/pdf',
    },
  },
};
const BREADCRUMBS = {
  default: {
    title: 'Interactive engineering diagrams',
    path: '/pnid_parsing_new',
  },
  flow: { title: 'Contextualize engineering diagrams' },
};

const getBreadcrumbs = () => {
  if (window.location.pathname.includes('pipeline'))
    return [BREADCRUMBS.default, BREADCRUMBS.flow];
  return [BREADCRUMBS.default];
};

export default function Routes() {
  const match = useRouteMatch<{ tenant: string; fileId?: string }>();

  return (
    <>
      <Breadcrumbs breadcrumbs={getBreadcrumbs()} />
      <PageWrapper>
        <GroupsRequired>
          <Switch>
            <Route
              exact
              path={landingPage.staticPath(match.path)}
              render={() => (
                <>
                  <PageTitle title="P&ID Contextualization" />
                  <LandingPage />
                </>
              )}
            />
            <Route
              exact
              path={diagramSelection.staticPath(match.path)}
              render={() => (
                <>
                  <StepsList />
                  <PageTitle title="P&ID Contextualization" />
                  <SearchPage
                    type="files"
                    secondaryType="P&ID"
                    key="fileSearch"
                    defaultFilters={PDF_FILTER}
                  />
                </>
              )}
            />
            <Route
              exact
              path={resourceSelection.staticPath(match.path)}
              render={() => (
                <>
                  <StepsList />
                  <PageTitle title="P&ID Contextualization" />
                  <SearchPage
                    type="assets"
                    secondaryType="tags"
                    key="assetSearch"
                  />
                </>
              )}
            />
            <Route
              exact
              path={configPage.staticPath(match.path)}
              render={() => (
                <>
                  <StepsList />
                  <PageTitle title="P&ID Contextualization" />
                  <Options />
                </>
              )}
            />
            <Route
              exact
              path={reviewPage.staticPath(match.path)}
              render={() => (
                <>
                  <StepsList />
                  <PageTitle title="P&ID Contextualization" />
                  <ResultsOverview />
                </>
              )}
            />
            <Route
              exact
              path={diagramPreview.staticPath(match.path)}
              render={() => (
                <>
                  <StepsList />
                  <PageTitle title="P&ID Contextualization" />
                  <FileOverview />
                </>
              )}
            />
          </Switch>
        </GroupsRequired>
      </PageWrapper>
    </>
  );
}
