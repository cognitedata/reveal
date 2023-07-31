import { SIDECAR } from 'constants/app';

export const getFavoritesEndpoint = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/favorites`;
