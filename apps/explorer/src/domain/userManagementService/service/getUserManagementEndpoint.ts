import sidecar from 'utils/sidecar';

export const getUserManagementEndpoint = (action: string) =>
  `${sidecar.userManagementServiceBaseUrl}/user/${action}`;
