import { fetchGet, FetchHeaders, fetchPatch, fetchDelete } from 'utils/fetch';

import { ProjectConfig } from '@cognite/discover-api-types';

import { SIDECAR } from 'constants/app';

const getProjectConfigEndpoint = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/config`;

export const projectConfig = {
  update: async (data: any, headers: FetchHeaders, project: string) =>
    fetchPatch(getProjectConfigEndpoint(project), data, {
      headers,
    }),

  getConfig: async (headers: FetchHeaders, project: string) =>
    fetchGet<ProjectConfig>(`${getProjectConfigEndpoint(project)}`, {
      headers,
    }),

  getMetadata: async (headers: FetchHeaders, project: string) =>
    fetchGet(`${getProjectConfigEndpoint(project)}/metadata`, { headers }),

  delete: async (headers: FetchHeaders, project: string) =>
    fetchDelete(`${getProjectConfigEndpoint(project)}/delete`, { headers }),
};
