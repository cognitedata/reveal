import * as React from 'react';
import { Metrics, PerfMetrics } from '@cognite/metrics';
import { getTenantInfo, isProduction } from '@cognite/react-container';
import { Metric } from 'web-vitals';

import reportWebVitals from '../internal/reportWebVitals';
import { extractToken } from '../auth';

export type mixpanelProps = {
  userId: string | undefined;
  mixpanelUser: { [key: string]: string } | undefined;
  appName: string;
  mixpanelToken: string;
};

type internalMetricsProps = {
  authToken: string | undefined;
  frontendMetricsBaseUrl?: string;
};

type Props = {
  internalMetricsSettings: internalMetricsProps;
  disableInternalMetrics?: boolean;
  disableMixpanel?: boolean;
  getMixpanelSettings?: () => mixpanelProps;
};

export const ProvideMetrics = ({
  getMixpanelSettings,
  internalMetricsSettings,
  disableInternalMetrics,
  disableMixpanel,
}: Props) => {
  const [tenant] = getTenantInfo();
  const authToken = extractToken(internalMetricsSettings.authToken);
  const mixpanelSettings = getMixpanelSettings?.();

  React.useEffect(() => {
    // Will run twice: Before the user loads, and after.
    // The first time we don't want to initialise Mixpanel
    if (mixpanelSettings && mixpanelSettings.userId) {
      const {
        REACT_APP_RELEASE: release = 'release',
        REACT_APP_VERSION_NAME: versionName = '0.0.0',
        REACT_APP_VERSION_SHA: build = 'development',
      } = process.env;

      const { appName, userId, mixpanelUser, mixpanelToken } = mixpanelSettings;

      const metricsConfig = {
        applicationId: appName,
        mixpanelToken,
        userId,
        release,
        versionName,
        build,
        debug: !isProduction,
        tenant,
      };

      try {
        if (disableMixpanel === false) {
          Metrics.init(metricsConfig);
          Metrics.identify(userId);
          if (mixpanelUser) {
            Metrics.people(mixpanelUser);
          }
        }

        // Send web-vitals to Mixpanel
        reportWebVitals((report: Metric) => {
          const metrics = Metrics.create('performance');
          metrics.track(report.name, { ...report });
        });
      } finally {
        /* continue regardless of error */
      }
    }

    if (internalMetricsSettings && disableInternalMetrics === false) {
      const { frontendMetricsBaseUrl } = internalMetricsSettings;

      if (authToken && frontendMetricsBaseUrl) {
        PerfMetrics.initialize(
          `${frontendMetricsBaseUrl}/${tenant}`,
          authToken,
          tenant
        );
        PerfMetrics.enable();
        // Send web-vitals to Internal Metrics
        reportWebVitals((report) => {
          PerfMetrics.pushMetricIncrementToServer({
            name: report.name,
            seconds: report.value / 1000,
          });
        });
      }
    }
  }, [mixpanelSettings, authToken, tenant]);
  // eslint-disable-next-line
  return <></>;
};
