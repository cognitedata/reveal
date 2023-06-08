import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { PageTitle } from '@cognite/cdf-utilities';
import PageSelection from '@interactive-diagrams-app/pages/PageSelection';
import PageResultsOverview from '@interactive-diagrams-app/pages/PageResultsOverview';
import PageFileOverview from '@interactive-diagrams-app/pages/PageFileOverview';
import PageOptions from '@interactive-diagrams-app/pages/PageOptions';
import LandingPage from '@interactive-diagrams-app/pages/LandingPage';
import GroupsRequired from '@interactive-diagrams-app/components/GroupsRequired';
import Breadcrumbs from '@interactive-diagrams-app/components/Breadcrumbs';
import {
  Flex,
  PageWrapper,
  StepsList,
} from '@interactive-diagrams-app/components/Common';
import {
  landingPage,
  diagramSelection,
  resourceSelectionAssets,
  resourceSelectionFiles,
  configPage,
  reviewPage,
  diagramPreview,
  root,
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
    path: `/${root}`,
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
      <GroupsRequired>
        <Switch>
          <Route
            exact
            path={landingPage.staticPath}
            render={() => (
              <PageWrapper>
                <PageTitle title="Interactive Engineering Diagrams" />
                <LandingPage />
              </PageWrapper>
            )}
          />
          <Route
            exact
            path={diagramSelection.staticPath}
            render={() => (
              <PageWrapper>
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
              </PageWrapper>
            )}
          />
          <Route
            exact
            path={resourceSelectionAssets.staticPath}
            render={() => (
              <PageWrapper>
                <PageTitle title="Interactive Engineering Diagrams" />
                <Flex row style={{ width: '100%' }}>
                  <StepsList />
                  <PageSelection
                    type="assets"
                    step="resourceSelectionAssets"
                    key="assetSelection"
                  />
                </Flex>
              </PageWrapper>
            )}
          />
          <Route
            exact
            path={resourceSelectionFiles.staticPath}
            render={() => (
              <PageWrapper>
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
              </PageWrapper>
            )}
          />
          <Route
            exact
            path={configPage.staticPath}
            render={() => (
              <PageWrapper>
                <PageTitle title="Interactive Engineering Diagrams" />
                <Flex row style={{ width: '100%' }}>
                  <StepsList />
                  <PageOptions step="config" />
                </Flex>
              </PageWrapper>
            )}
          />
          <Route
            exact
            path={reviewPage.staticPath}
            render={() => (
              <PageWrapper>
                <PageTitle title="Interactive Engineering Diagrams" />
                <Flex row style={{ width: '100%' }}>
                  <StepsList />
                  <PageResultsOverview step="review" />
                </Flex>
              </PageWrapper>
            )}
          />
          <Route
            exact
            path={diagramPreview.staticPath}
            render={() => (
              <>
                <PageTitle title="Interactive Engineering Diagrams" />
                <PageFileOverview step="diagramPreview" />
              </>
            )}
          />
        </Switch>
      </GroupsRequired>
    </>
  );
}
