/* eslint-disable camelcase */
import * as React from 'react';
import {
  intercomHelper,
  intercomInitialization,
  IntercomBootSettings,
} from '@cognite/intercom-helper';
import { SidecarConfig } from '@cognite/react-tenant-selector';

import { getAuthHeaders } from '../auth';

import { ConditionalWrapperWithProps } from './ConditionalWrapper';

interface IntercomProps {
  intercomSettings: IntercomBootSettings;
  project: string;
  sidecar: SidecarConfig;
  children: React.ReactElement;
}
export const Intercom: React.FC<IntercomProps> = ({
  intercomSettings,
  project,
  sidecar,
  children,
}) => {
  const { appsApiBaseUrl } = sidecar;
  const authHeaders = getAuthHeaders();

  React.useEffect(() => {
    intercomInitialization(intercomSettings.app_id).then(() => {
      intercomHelper.boot(intercomSettings);
      intercomHelper.identityVerification({
        appsApiUrl: appsApiBaseUrl,
        headers: authHeaders,
        project,
      });
    });

    return () => {
      intercomHelper.shutdown();
    };
  }, []);

  return children;
};

interface IntercomContainerProps {
  disabled?: boolean;
  intercomSettings?: IntercomBootSettings;
  project: string;
  sidecar: SidecarConfig;
  children: React.ReactElement;
}
export const IntercomContainer: React.FC<IntercomContainerProps> = ({
  disabled,
  intercomSettings,
  project,
  children,
  sidecar,
}) => (
  <ConditionalWrapperWithProps
    condition={!disabled && intercomSettings && !!intercomSettings.app_id}
    sidecar={sidecar}
    intercomSettings={intercomSettings}
    project={project}
    wrap={Intercom}
  >
    {children}
  </ConditionalWrapperWithProps>
);
