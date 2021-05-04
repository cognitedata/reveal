import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { PageTitle } from '@cognite/cdf-utilities';
import SelectionPage from 'pages/SelectionPage';
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
  return (
    <>
      <Breadcrumbs breadcrumbs={getBreadcrumbs()} />
      <PageWrapper>
        <GroupsRequired>
          <Switch>
            <Route
              exact
              path={landingPage.staticPath}
              render={() => (
                <>
                  <PageTitle title="P&ID Contextualization" />
                  <LandingPage />
                </>
              )}
            />
            <Route
              exact
              path={diagramSelection.staticPath}
              render={() => (
                <>
                  <StepsList />
                  <PageTitle title="P&ID Contextualization" />
                  <SelectionPage
                    defaultFilters={PDF_FILTER}
                    required
                    step="diagramSelection"
                    type="files"
                    key="diagramSelection"
                  />
                </>
              )}
            />
            <Route
              exact
              path={resourceSelection.staticPath}
              render={() => (
                <>
                  <StepsList />
                  <PageTitle title="P&ID Contextualization" />
                  <SelectionPage
                    step="resourceSelection"
                    type="assets"
                    key="assetselection"
                  />
                </>
              )}
            />
            <Route
              exact
              path={configPage.staticPath}
              render={() => (
                <>
                  <StepsList />
                  <PageTitle title="P&ID Contextualization" />
                  <Options step="config" />
                </>
              )}
            />
            <Route
              exact
              path={reviewPage.staticPath}
              render={() => (
                <>
                  <StepsList />
                  <PageTitle title="P&ID Contextualization" />
                  <ResultsOverview step="review" />
                </>
              )}
            />
            <Route
              exact
              path={diagramPreview.staticPath}
              render={() => (
                <>
                  <StepsList />
                  <PageTitle title="P&ID Contextualization" />
                  <FileOverview step="diagramPreview" />
                </>
              )}
            />
          </Switch>
        </GroupsRequired>
      </PageWrapper>
    </>
  );
}
