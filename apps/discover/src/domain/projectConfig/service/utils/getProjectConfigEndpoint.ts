import { SIDECAR } from 'constants/app';

export const getProjectConfigEndpoint = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/config`;
