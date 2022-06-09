import * as React from 'react';
import { Metrics, PerfMetrics } from '@cognite/metrics';
import { getTenantInfo, isProduction } from '@cognite/react-container';
import { Metric } from 'web-vitals';
import { AuthenticatedUser } from '@cognite/auth-utils';
import { ContainerSidecarConfig } from 'types';

import reportWebVitals from '../internal/reportWebVitals';
import { extractToken } from '../auth';
import { getUserForMixpanel } from '../internal';
import { AuthConsumer } from '../components';

export type mixpanelProps = {
  userId: string;
  mixpanelUser?: { [key: string]: string };
  appName: string;
  mixpanelToken: string | undefined;
};

type Props = {
  sidecar: ContainerSidecarConfig;
  authState: AuthenticatedUser;
};

const ProvideMetricsComponent = ({ sidecar, authState }: Props) => {
  const { frontendMetricsBaseUrl, disableMixpanel, disableInternalMetrics } =
    sidecar;
  const [tenant] = getTenantInfo();
  const authToken = extractToken(authState.token);
  const [mixpanelUserData, setMixpanelUserData] = React.useState<
    mixpanelProps | undefined
  >(undefined);
  /**
   * Initialization
   */
  React.useEffect(() => {
    const { applicationId, mixpanel } = sidecar;
    const { token, idToken } = authState;
    getUserForMixpanel(sidecar, token, idToken, applicationId).then(
      (mixpanelUser) => {
        if (mixpanelUser) {
          setMixpanelUserData({
            ...mixpanelUser,
            mixpanelToken: mixpanel,
            appName: applicationId,
          });
        }
      }
    );
  }, [sidecar, authState]);

  React.useEffect(() => {
    if (mixpanelUserData && mixpanelUserData.userId) {
      const {
        REACT_APP_RELEASE: release = 'release',
        REACT_APP_VERSION_NAME: versionName = '0.0.0',
        REACT_APP_VERSION_SHA: build = 'development',
      } = process.env;

      const { appName, userId, mixpanelUser, mixpanelToken } = mixpanelUserData;

      try {
        if (disableMixpanel !== true && mixpanelToken) {
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
          Metrics.init(metricsConfig);
          Metrics.identify(userId);
          if (mixpanelUser) {
            Metrics.people(mixpanelUser);
          }
          // Send web-vitals to Mixpanel
          reportWebVitals((report: Metric) => {
            const metrics = Metrics.create('performance');
            metrics.track(report.name, { ...report });
          });
        }
      } finally {
        /* continue regardless of error */
      }
    }
  }, [mixpanelUserData]);

  React.useEffect(() => {
    if (disableInternalMetrics !== true) {
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
  }, [authToken, tenant]);
  // eslint-disable-next-line
  return <></>;
};

type ProvideMetricsProps = {
  sidecar: ContainerSidecarConfig;
};

export const ProvideMetrics = ({ sidecar }: ProvideMetricsProps) => {
  return (
    <AuthConsumer>
      {(authState) => {
        return (
          authState.authState?.authenticated && (
            <ProvideMetricsComponent
              sidecar={sidecar}
              authState={authState.authState}
            />
          )
        );
      }}
    </AuthConsumer>
  );
};
