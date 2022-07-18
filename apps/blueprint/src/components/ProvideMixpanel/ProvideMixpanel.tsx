import { Metrics } from '@cognite/metrics';
import { getTenantInfo, useAuthContext } from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import reportWebVitals from 'utils/reportWebVitals';
import React from 'react';

export const ProvideMixpanel: React.FC<
  React.PropsWithChildren<Record<string, unknown>>
> = ({ children }) => {
  const { authState } = useAuthContext();

  const email = authState?.email;
  const userId = authState?.id;
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
      applicationId: sidecar.applicationId,
      mixpanelToken: sidecar.mixpanel,
      userId,
      release,
      versionName,
      build,
      tenant,
    };

    try {
      Metrics.init(metricsConfig);
      Metrics.identify(userId);
      Metrics.props({
        tenant,
      });
      if (email) {
        Metrics.people({
          name: email,
          $email: email,
        });
      }

      // Send web-vitals to Mixpanel
      reportWebVitals((report) => {
        Metrics.create('performance').track(report.name, { ...report });
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  return <div>{children}</div>;
};

export default ProvideMixpanel;
