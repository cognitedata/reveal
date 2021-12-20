import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';

import { ToastContainer } from '@cognite/cogs.js';
import { Logout } from '@cognite/react-container';

import { Page } from 'components/page';
import navigation from 'constants/navigation';
import { usePageSettings } from 'hooks/usePageSettings';
import { useUserSyncQuery } from 'modules/api/user/useUserQuery';
import AdminPageContainer from 'pages/authorized/admin';
import { ProjectConfig } from 'pages/authorized/admin/projectConfig';
import { AppFrame } from 'pages/authorized/elements';
import { Favorites } from 'pages/authorized/favorites';
import { CreateFavoriteSetModal } from 'pages/authorized/favorites/modals';
import { NotFoundPage } from 'pages/authorized/notfound';
import { Search } from 'pages/authorized/search';

import { CookieConsent } from './CookieConsent';
import { Dashboard } from './search/dashboard';

const Content = () => {
  useUserSyncQuery();
  const pageSettings = usePageSettings();

  return (
    <div role="application">
      <ToastContainer />
      <CreateFavoriteSetModal /> {/* Global Modal to create Favorite set */}
      <AppFrame>
        <Page
          scrollPage={pageSettings.scrollPage}
          collapseTopbar={pageSettings.collapseTopbar}
        >
          <React.Suspense fallback="">
            <Switch>
              <Route path={navigation.SEARCH} render={() => <Search />} />
              <Route path={navigation.FAVORITES} render={() => <Favorites />} />
              <Route path={navigation.DASHBOARD} render={() => <Dashboard />} />

              <Route
                path={navigation.ADMIN}
                render={() => <AdminPageContainer />}
              />

              <Route
                path={navigation.INTERNAL_PROJECT_CONFIG}
                render={() => <ProjectConfig />}
              />

              <Route path={navigation.LOGOUT} render={() => <Logout />} />
              <Redirect from="" to={navigation.SEARCH} />
              <Redirect from="/" to={navigation.SEARCH} />
              <Route render={() => <NotFoundPage />} />
            </Switch>
          </React.Suspense>
        </Page>
      </AppFrame>
      <CookieConsent />
    </div>
  );
};

export default Content;
