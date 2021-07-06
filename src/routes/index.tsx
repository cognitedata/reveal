import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { PageTitle } from '@cognite/cdf-utilities';
import PageSelection from 'pages/PageSelection';
import PageResultsOverview from 'pages/PageResultsOverview';
import PageFileOverview from 'pages/PageFileOverview';
import PageOptions from 'pages/PageOptions';
import LandingPage from 'pages/LandingPage';
import GroupsRequired from 'components/GroupsRequired';
import Breadcrumbs from 'components/Breadcrumbs';
import StepsList from 'components/StepsList';
import { Flex, PageWrapper } from 'components/Common';
import BetaBanner from 'components/BetaBanner';
import {
  landingPage,
  diagramSelection,
  resourceSelectionAssets,
  resourceSelectionFiles,
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
  workflow: {
    title: 'Create interactive diagrams',
  },
};

const getBreadcrumbs = () => {
  if (window.location.href.includes('workflow')) {
    return [BREADCRUMBS.default, BREADCRUMBS.workflow];
  }
  return [BREADCRUMBS.default];
};

export default function Routes() {
  return (
    <>
      <Breadcrumbs breadcrumbs={getBreadcrumbs()} />
      <PageWrapper>
        <BetaBanner />
        <GroupsRequired>
          <Switch>
            <Route
              exact
              path={landingPage.staticPath}
              render={() => (
                <>
                  <PageTitle title="Interactive Engineering Diagrams" />
                  <LandingPage />
                </>
              )}
            />
            <Route
              exact
              path={diagramSelection.staticPath}
              render={() => (
                <>
                  <PageTitle title="Interactive Engineering Diagrams" />
                  <Flex row style={{ width: '100%' }}>
                    <StepsList />
                    <PageSelection
                      defaultFilters={PDF_FILTER}
                      required
                      type="files"
                      step="diagramSelection"
                      key="diagramSelection"
                    />
                  </Flex>
                </>
              )}
            />
            <Route
              exact
              path={resourceSelectionAssets.staticPath}
              render={() => (
                <>
                  <PageTitle title="Interactive Engineering Diagrams" />
                  <Flex row style={{ width: '100%' }}>
                    <StepsList />
                    <PageSelection
                      type="assets"
                      step="resourceSelectionAssets"
                      key="assetSelection"
                    />
                  </Flex>
                </>
              )}
            />
            <Route
              exact
              path={resourceSelectionFiles.staticPath}
              render={() => (
                <>
                  <PageTitle title="Interactive Engineering Diagrams" />
                  <Flex row style={{ width: '100%' }}>
                    <StepsList />
                    <PageSelection
                      defaultFilters={PDF_FILTER}
                      type="files"
                      step="resourceSelectionFiles"
                      key="fileSelection"
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
                  <PageTitle title="Interactive Engineering Diagrams" />
                  <Flex row style={{ width: '100%' }}>
                    <StepsList />
                    <PageOptions step="config" />
                  </Flex>
                </>
              )}
            />
            <Route
              exact
              path={reviewPage.staticPath}
              render={() => (
                <>
                  <PageTitle title="Interactive Engineering Diagrams" />
                  <Flex row style={{ width: '100%' }}>
                    <StepsList />
                    <PageResultsOverview step="review" />
                  </Flex>
                </>
              )}
            />
            <Route
              exact
              path={diagramPreview.staticPath}
              render={() => (
                <>
                  <PageTitle title="Interactive Engineering Diagrams" />
                  <Flex row style={{ width: '100%' }}>
                    <StepsList />
                    <PageFileOverview step="diagramPreview" />
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
