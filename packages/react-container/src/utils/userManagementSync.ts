import axios from 'axios';
import { SidecarConfig } from '@cognite/sidecar';
import { AuthenticatedUser } from '@cognite/auth-utils';
import { reportException } from '@cognite/react-errors';

import { getHeaders } from '../auth';

import { log } from './log';

/**
 * Sync user with User Management Service.
 *
 * Enable sync by adding 'enableUserManagement: true' in consuming application sidecar.
 */
export const syncUser = async (
  authState: AuthenticatedUser,
  sidecar: SidecarConfig
): Promise<void> => {
  if (!sidecar.enableUserManagement) {
    return;
  }

  if (!authState.token || !authState.idToken) {
    // Legacy token not currently support, thus just add warning.
    log('[User Sync]: Missing access token or id token', [], 2);
    return;
  }

  const umsUserSyncEndpoint = `${sidecar.userManagementServiceBaseUrl}/user/sync`;

  // Silent sync
  await axios
    .post(
      umsUserSyncEndpoint,
      { accessToken: authState.token },
      getHeaders(authState.idToken)
    )
    .catch((error) => {
      reportException(error);
    });
};
