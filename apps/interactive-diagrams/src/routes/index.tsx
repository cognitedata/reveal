import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Breadcrumbs from '@interactive-diagrams-app/components/Breadcrumbs';
import {
  Flex,
  PageWrapper,
  StepsList,
} from '@interactive-diagrams-app/components/Common';
import GroupsRequired from '@interactive-diagrams-app/components/GroupsRequired';
import LandingPage from '@interactive-diagrams-app/pages/LandingPage';
import PageFileOverview from '@interactive-diagrams-app/pages/PageFileOverview';
import PageOptions from '@interactive-diagrams-app/pages/PageOptions';
import PageResultsOverview from '@interactive-diagrams-app/pages/PageResultsOverview';
import PageSelection from '@interactive-diagrams-app/pages/PageSelection';

import { PageTitle } from '@cognite/cdf-utilities';

import {
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

export default function AppRoutes() {
  return (
    <>
      <Breadcrumbs breadcrumbs={getBreadcrumbs()} />
      <GroupsRequired>
        <Routes>
          <Route
            index
            element={
              <PageWrapper>
                <PageTitle title="Interactive Engineering Diagrams" />
                <LandingPage />
              </PageWrapper>
            }
          />
          <Route
            path={diagramSelection.staticPath}
            element={
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
            }
          />
          <Route
            path={resourceSelectionAssets.staticPath}
            element={
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
            }
          />
          <Route
            path={resourceSelectionFiles.staticPath}
            element={
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
            }
          />
          <Route
            path={configPage.staticPath}
            element={
              <PageWrapper>
                <PageTitle title="Interactive Engineering Diagrams" />
                <Flex row style={{ width: '100%' }}>
                  <StepsList />
                  <PageOptions step="config" />
                </Flex>
              </PageWrapper>
            }
          />
          <Route
            path={reviewPage.staticPath}
            element={
              <PageWrapper>
                <PageTitle title="Interactive Engineering Diagrams" />
                <Flex row style={{ width: '100%' }}>
                  <StepsList />
                  <PageResultsOverview step="review" />
                </Flex>
              </PageWrapper>
            }
          />
          <Route
            path={diagramPreview.staticPath}
            element={
              <>
                <PageTitle title="Interactive Engineering Diagrams" />
                <PageFileOverview step="diagramPreview" />
              </>
            }
          />
        </Routes>
      </GroupsRequired>
    </>
  );
}
