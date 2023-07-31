import axios from 'axios';
import { SidecarConfig } from '@cognite/sidecar';
import { reportException } from '@cognite/react-errors';

import { getAuthorizationHeader } from '../auth/headers';

import { log } from './log';

/**
 * Sync user with User Management Service.
 *
 * Enable sync by adding 'enableUserManagement: true' in consuming application sidecar.
 */
export const syncUser = async (
  accessToken: string,
  idToken: string | undefined,
  sidecar: SidecarConfig
): Promise<void> => {
  if (!sidecar.enableUserManagement) {
    return;
  }

  if (!accessToken) {
    // Legacy token not currently support, thus just add warning.
    log('[User Sync]: Missing access token', [], 2);
    return;
  }

  const umsUserSyncEndpoint = `${sidecar.userManagementServiceBaseUrl}/user/sync`;

  // Silent sync
  await axios
    .post(
      umsUserSyncEndpoint,
      { accessToken },
      {
        headers: {
          ...getAuthorizationHeader(idToken || accessToken),
          // Used for legacy token
          fasAppId: sidecar.aadApplicationId ? sidecar.aadApplicationId : '',
        },
      }
    )
    .catch((error) => {
      reportException(error);
    });
};
