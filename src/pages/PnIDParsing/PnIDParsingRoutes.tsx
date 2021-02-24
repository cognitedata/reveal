import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { PageTitle } from '@cognite/cdf-utilities';
import SearchPage from 'containers/SearchPage';
import GroupsRequired from 'components/GroupsRequired';
import PnIDParsing from './PnIDParsing';
import PnIDParsingFilePreview from './PnIDParsingFilePreview';
import PnIDOptions from './PnIDOptions';

const PDF_FILTER = {
  files: {
    filter: {
      mimeType: 'application/pdf',
    },
  },
};

function PnIDParsingRoutes() {
  const match = useRouteMatch<{ tenant: string; fileId?: string }>();

  return (
    <GroupsRequired>
      <Switch>
        <Route
          exact
          path={`${match.path}/`}
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
          path={`${match.path}/:filesDataKitId`}
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
          path={`${match.path}/:filesDataKitId/:assetsDataKitId`}
          render={() => (
            <>
              <PageTitle title="P&ID Contextualization" />
              <PnIDOptions />
            </>
          )}
        />
        <Route
          exact
          path={`${match.path}/:filesDataKitId/:assetsDataKitId/:optionsId`}
          render={() => (
            <>
              <PageTitle title="P&ID Contextualization" />
              <PnIDParsing />
            </>
          )}
        />
        <Route
          exact
          path={`${match.path}/:filesDataKitId/:assetsDataKitId/:optionsId/pnid/:fileId`}
          render={() => (
            <>
              <PageTitle title="P&ID Contextualization" />{' '}
              <PnIDParsingFilePreview />
            </>
          )}
        />
      </Switch>
    </GroupsRequired>
  );
}

export default PnIDParsingRoutes;
