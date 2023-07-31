import { SIDECAR } from 'constants/app';

export const getUserManagementEndpoint = (action: string) =>
  `${SIDECAR.userManagementServiceBaseUrl}/user/${action}`;
