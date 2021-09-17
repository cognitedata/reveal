import axios from 'axios';
import { SidecarConfig } from '@cognite/react-tenant-selector';
import { AuthenticatedUser } from '@cognite/auth-utils';
import { reportException } from '@cognite/react-errors';

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

  if (!authState.token && !authState.idToken) {
    log('[User Sync]: Missing access token and id token');
    return;
  }

  let umsUrl;
  if (sidecar.userManagementServiceBaseUrl) {
    umsUrl = `${sidecar.userManagementServiceBaseUrl}/user/sync`;
  } else {
    umsUrl = `http://localhost:8600/user/sync`;
  }

  // Silent sync
  await axios
    .post(
      umsUrl,
      { accessToken: authState.token },
      {
        headers: { Authorization: `Bearer ${authState.idToken}` },
      }
    )
    .catch((error) => {
      reportException(error);
    });
};
