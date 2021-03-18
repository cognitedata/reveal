import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { PageTitle } from '@cognite/cdf-utilities';
import SearchPage from 'pages/SearchPage';
import ResultsOverview from 'pages/ResultsOverview';
import FileOverview from 'pages/FileOverview';
import Options from 'pages/Options';
import LandingPage from 'pages/LandingPage';
import GroupsRequired from 'components/GroupsRequired';

const PDF_FILTER = {
  files: {
    filter: {
      mimeType: 'application/pdf',
    },
  },
};

export default function Routes() {
  const match = useRouteMatch<{ tenant: string; fileId?: string }>();

  return (
    <GroupsRequired>
      <Switch>
        <Route
          exact
          path={`${match.path}`}
          render={() => (
            <>
              <PageTitle title="P&ID Contextualization" />
              <LandingPage />
            </>
          )}
        />
        <Route
          exact
          path={`${match.path}/files`}
          render={() => (
            <>
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
          path={`${match.path}/files/:filesDataKitId/assets`}
          render={() => (
            <>
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
          path={`${match.path}/files/:filesDataKitId/assets/:assetsDataKitId`}
          render={() => (
            <>
              <PageTitle title="P&ID Contextualization" />
              <Options />
            </>
          )}
        />
        <Route
          exact
          path={`${match.path}/files/:filesDataKitId/assets/:assetsDataKitId/:optionsId`}
          render={() => (
            <>
              <PageTitle title="P&ID Contextualization" />
              <ResultsOverview />
            </>
          )}
        />
        <Route
          exact
          path={`${match.path}/files/:filesDataKitId/assets/:assetsDataKitId/:optionsId/pnid/:fileId`}
          render={() => (
            <>
              <PageTitle title="P&ID Contextualization" /> <FileOverview />
            </>
          )}
        />
      </Switch>
    </GroupsRequired>
  );
}
