import React, { useEffect } from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';

import { PerfMetrics } from '@cognite/metrics';
import { Logout } from '@cognite/react-container';

import { Page } from 'components/Page';
import {
  PerformanceMetricsObserver,
  searchVisibleQuery,
} from 'components/Performance';
import navigation from 'constants/navigation';
import { usePageSettings } from 'hooks/usePageSettings';
import AdminPageContainer from 'pages/authorized/admin';
import { ProjectConfig } from 'pages/authorized/admin/projectConfig';
import { AppFrame } from 'pages/authorized/elements';
import { Favorites } from 'pages/authorized/favorites';
import { NotFoundPage } from 'pages/authorized/notfound';
import { ReportManager } from 'pages/authorized/report-manager';
import { Search } from 'pages/authorized/search';

import { LOG_APP_CLOSED, LOG_APP_NAMESPACE } from '../../constants/logging';
import { useGlobalMetrics } from '../../hooks/useGlobalMetrics';

import { CookieConsent } from './CookieConsent';
import { GlobalModals } from './GlobalModals';
import { Dashboard } from './search/dashboard';

const Content = () => {
  const pageSettings = usePageSettings();

  const metrics = useGlobalMetrics(LOG_APP_NAMESPACE);

  useEffect(() => {
    // For this metric to work, PR2537 needs to get merged in https://github.com/cognitedata/applications/pull/2537
    PerfMetrics.trackPerfStart('SEARCH_LOAD');
    const cleanup = () => {
      metrics.track(LOG_APP_CLOSED);
    };

    window.addEventListener('beforeunload', cleanup);

    return () => {
      window.removeEventListener('beforeunload', cleanup);
    };
  }, []);

  const handlePerformanceObserved = (mutations: any) => {
    if (mutations) {
      PerfMetrics.findInMutation({
        ...searchVisibleQuery,
        mutations,
        callback: (_output: any) => {
          PerfMetrics.trackPerfEnd('SEARCH_LOAD');
        },
      });
    }
  };

  return (
    <PerformanceMetricsObserver onChange={handlePerformanceObserved}>
      <div role="application">
        <GlobalModals /> {/* Global Modals to be shown from multiple places */}
        <AppFrame>
          <Page
            scrollPage={pageSettings.scrollPage}
            collapseTopbar={pageSettings.collapseTopbar}
          >
            <React.Suspense fallback="">
              <Switch>
                <Route path={navigation.SEARCH} render={() => <Search />} />
                <Route
                  path={navigation.FAVORITES}
                  render={() => <Favorites />}
                />
                <Route
                  path={navigation.DASHBOARD}
                  render={() => <Dashboard />}
                />

                <Route
                  path={navigation.ADMIN}
                  render={() => <AdminPageContainer />}
                />

                <Route
                  path={navigation.INTERNAL_PROJECT_CONFIG}
                  render={() => <ProjectConfig />}
                />

                <Route
                  path={navigation.REPORT_PANEL}
                  render={() => <ReportManager />}
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
    </PerformanceMetricsObserver>
  );
};

export default Content;
