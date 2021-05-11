/* eslint-disable camelcase */
import * as React from 'react';

import {
  intercomHelper,
  intercomInitialization,
  IntercomBootSettings,
} from '@cognite/intercom-helper';
import { SidecarConfig } from '@cognite/react-tenant-selector';

import { getAuthHeaders } from 'auth';

interface IntercomContainerProps {
  intercomSettings?: IntercomBootSettings;
  sidecar: SidecarConfig;
  children: React.ReactElement;
}
export const IntercomContainer: React.FC<IntercomContainerProps> = ({
  intercomSettings,
  sidecar,
  children,
}) => {
  const { appsApiBaseUrl } = sidecar;
  const authHeaders = getAuthHeaders();

  React.useEffect(() => {
    if (intercomSettings) {
      intercomInitialization(intercomSettings.app_id).then(() => {
        intercomHelper.boot(intercomSettings);
        intercomHelper.identityVerification({
          appsApiUrl: appsApiBaseUrl,
          headers: authHeaders,
        });
      });
    }

    return () => {
      if (intercomSettings) {
        intercomHelper.shutdown();
      }
    };
  }, []);

  return children;
};
