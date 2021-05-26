import * as React from 'react';
import * as Sentry from '@sentry/browser';
import { TenantSelector } from '@cognite/react-tenant-selector';
import { configureI18n, withI18nSuspense } from '@cognite/react-i18n';
import { Metrics } from '@cognite/metrics';

import { SIDECAR } from './sidecar';

const {
  REACT_APP_RELEASE_ID,
  REACT_APP_SENTRY_DSN,
  REACT_APP_MIXPANEL_TOKEN,
  REACT_APP_LOCIZE_PROJECT_ID,
  REACT_APP_LOCIZE_API_KEY,
  REACT_APP_ENV,
  NODE_ENV,
} = process.env;

export const App = () => {
  const [finishedLoading, setFinishedLoading] = React.useState(false);

  const loadTranslations = async () => {
    await configureI18n({
      locize: {
        version: NODE_ENV === 'development' ? 'latest' : 'Production',
        // note: these env vars are set from ./scripts/start.sh
        projectId: REACT_APP_LOCIZE_PROJECT_ID || '',
        apiKey: REACT_APP_LOCIZE_API_KEY,
      },
      disabled: SIDECAR.disableTranslations,
      keySeparator: false,
    });

    setFinishedLoading(true);
  };

  React.useEffect(() => {
    loadTranslations();

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

  return finishedLoading ? <TenantSelector sidecar={SIDECAR} /> : null;
};

export default SIDECAR.disableTranslations ? App : withI18nSuspense(App);
