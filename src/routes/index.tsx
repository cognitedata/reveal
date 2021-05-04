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
import { Flex, PageWrapper } from 'components/Common';
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
                  <PageTitle title="P&ID Contextualization" />
                  <Flex row style={{ width: '100%' }}>
                    <StepsList />
                    <SelectionPage
                      defaultFilters={PDF_FILTER}
                      required
                      step="diagramSelection"
                      type="files"
                      key="diagramSelection"
                    />
                  </Flex>
                </>
              )}
            />
            <Route
              exact
              path={resourceSelection.staticPath}
              render={() => (
                <>
                  <PageTitle title="P&ID Contextualization" />
                  <Flex row style={{ width: '100%' }}>
                    <StepsList />
                    <SelectionPage
                      step="resourceSelection"
                      type="assets"
                      key="assetselection"
                    />
                  </Flex>
                </>
              )}
            />
            <Route
              exact
              path={configPage.staticPath}
              render={() => (
                <>
                  <PageTitle title="P&ID Contextualization" />
                  <Flex row style={{ width: '100%' }}>
                    <StepsList />
                    <Options step="config" />
                  </Flex>
                </>
              )}
            />
            <Route
              exact
              path={reviewPage.staticPath}
              render={() => (
                <>
                  <PageTitle title="P&ID Contextualization" />
                  <Flex row style={{ width: '100%' }}>
                    <StepsList />
                    <ResultsOverview step="review" />
                  </Flex>
                </>
              )}
            />
            <Route
              exact
              path={diagramPreview.staticPath}
              render={() => (
                <>
                  <PageTitle title="P&ID Contextualization" />
                  <Flex row style={{ width: '100%' }}>
                    <StepsList />
                    <FileOverview step="diagramPreview" />
                  </Flex>
                </>
              )}
            />
          </Switch>
        </GroupsRequired>
      </PageWrapper>
    </>
  );
}
