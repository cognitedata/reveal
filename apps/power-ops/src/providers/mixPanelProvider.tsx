import * as React from 'react';
import { Metrics } from '@cognite/metrics';
import * as Sentry from '@sentry/browser';
import { getTenantInfo, isProduction } from '@cognite/react-container';
import isFunction from 'lodash/isFunction';
import { ReportHandler } from 'web-vitals';

import config from '../utils/config';
import sidecar from '../utils/sidecar';

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && isFunction(onPerfEntry)) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export const ProvideMixpanelSetup: React.FC = ({ children }) => {
  const [tenant] = getTenantInfo();

  // Will run twice: Before the user loads, and after.
  // The first time we don't want to initialise Mixpanel
  const {
    REACT_APP_RELEASE_ID: release = 'release',
    REACT_APP_VERSION_NAME: versionName = '0.0.0',
    REACT_APP_VERSION_SHA: build = 'development',
  } = process.env;

  const metricsConfig = {
    applicationId: sidecar.applicationName,
    mixpanelToken:
      process.env.REACT_APP_MIXPANEL_TOKEN || sidecar.mixpanel || '',
    release,
    versionName,
    build,
    debug: !isProduction || process.env.REACT_APP_MIXPANEL_DEBUG === 'true',
    tenant,
    environment: config.env,
  };

  try {
    Metrics.init(metricsConfig);
    // Send web-vitals to Mixpanel
    reportWebVitals((report) => {
      Metrics.create('performance').track(report.name, { ...report });
    });
  } catch (error) {
    Sentry.captureException(error);
  }

  return <>{children}</>;
};
