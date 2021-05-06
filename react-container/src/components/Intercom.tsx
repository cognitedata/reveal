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
  const { intercom, appsApiBaseUrl } = sidecar;

  if (intercom && intercomSettings) {
    React.useEffect(() => {
      intercomInitialization(intercom).then(() => {
        intercomHelper.boot(intercomSettings);
        intercomHelper.identityVerification({
          appsApiUrl: appsApiBaseUrl,
          headers: {
            Authorization: getAuthHeaders(),
          },
        });
      });

      return () => {
        intercomHelper.shutdown();
      };
    }, []);
  }

  return children;
};
