import * as React from 'react';

import { useMetricsUser } from 'services/user/useMetricsUser';

import { Metrics } from '@cognite/metrics';
import { getTenantInfo, isProduction } from '@cognite/react-container';

import { SIDECAR } from 'constants/app';
import { APP_NAME } from 'constants/general';
import reportWebVitals from 'core/reportWebVitals';

export const ProvideMixpanelSetup: React.FC<React.PropsWithChildren<unknown>> =
  ({ children }) => {
    const { userId, mixpanelUser } = useMetricsUser();

    const [tenant] = getTenantInfo();

    // Will run twice: Before the user loads, and after.
    // The first time we don't want to initialise Mixpanel
    if (userId) {
      const {
        REACT_APP_RELEASE: release = 'release',
        REACT_APP_VERSION_NAME: versionName = '0.0.0',
        REACT_APP_VERSION_SHA: build = 'development',
      } = process.env;

      const metricsConfig = {
        applicationId: APP_NAME,
        mixpanelToken: SIDECAR.mixpanel,
        userId,
        release,
        versionName,
        build,
        debug: !isProduction,
        tenant,
      };

      try {
        Metrics.init(metricsConfig);
        Metrics.identify(userId);

        if (mixpanelUser) {
          Metrics.people(mixpanelUser);
        }

        // Send web-vitals to Mixpanel
        reportWebVitals((report) => {
          Metrics.create('performance').track(report.name, { ...report });
        });
      } catch (error) {
        console.error(error);
      }
    }

    return <>{children}</>;
  };
