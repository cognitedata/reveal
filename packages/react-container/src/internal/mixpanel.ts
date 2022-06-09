import axios from 'axios';
import { SidecarConfig } from '@cognite/sidecar';

import { log } from '../utils';
import { getAuthorizationHeader } from '../auth';

export type mixpanelUserType = {
  userId: string;
  mixpanelUser?: { [key: string]: string };
};

export const getUserForMixpanel = (
  sidecar: SidecarConfig,
  accessToken: string | undefined,
  idToken: string | undefined,
  project: string
): Promise<mixpanelUserType | undefined> => {
  const endpoint = `${sidecar.userManagementServiceBaseUrl}/user/me`;
  return new Promise((resolve, _reject) => {
    axios
      .get(endpoint, {
        headers: {
          ...getAuthorizationHeader(idToken || accessToken || ''),
          fasAppId: sidecar.aadApplicationId ? sidecar.aadApplicationId : '',
          'content-type': 'application/json',
          'x-cdp-project': project,
        },
      })
      .then((response) => {
        const { displayName, email, id } = response.data;
        const names: string[] = [];
        if (displayName) {
          names.push(displayName);
        }
        if (names.length === 0 && email) {
          names.push(email);
        }

        const mixpanelUser: { [key: string]: string } = {};
        if (names.length > 0) {
          mixpanelUser.$name = names.join(' ');
        }

        if (email) {
          mixpanelUser.$email = email;
        }

        if (Object.keys(mixpanelUser).length > 0) {
          resolve({
            userId: id,
            mixpanelUser,
          });
        } else {
          resolve({
            userId: id,
          });
        }
      })
      .catch((error) => {
        log('[GetUserForMixPanel] Exception ', error);
        resolve(undefined);
      });
  });
};
