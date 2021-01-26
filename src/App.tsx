import * as React from 'react';
import * as Sentry from '@sentry/browser';
import { TenantSelector } from '@cognite/react-tenant-selector';

import { withI18nSuspense } from '@cognite/react-i18n';
import { Metrics } from '@cognite/metrics';

const {
  REACT_APP_RELEASE_ID,
  REACT_APP_SENTRY_DSN,
  REACT_APP_MIXPANEL_TOKEN,
  REACT_APP_ENV,
  NODE_ENV,
} = process.env;

export const App = () => {
  React.useEffect(() => {
    if (REACT_APP_SENTRY_DSN) {
      Sentry.init({
        dsn: REACT_APP_SENTRY_DSN,
        // This is populated by the FAS build process. Change it if you want to
        // source this information from somewhere else.
        release: REACT_APP_RELEASE_ID,
        // This is populated by react-scripts. However, this can be overridden by
        // the app's build process if you wish.
        environment: REACT_APP_ENV || NODE_ENV || 'development',
      });
    }

    Metrics.init({
      mixpanelToken: REACT_APP_MIXPANEL_TOKEN,
      environment: REACT_APP_ENV || NODE_ENV || 'development',
    });
  }, []);

  return <TenantSelector />;
};

export default withI18nSuspense(App);
