import {
  fetchGet,
  FetchHeaders,
  fetchPatch,
  fetchDelete,
} from '_helpers/fetch';
import { SIDECAR } from 'constants/app';

import { ProjectConfigResult } from './types';

const getProjectConfigEndpoint = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/config`;

export const projectConfig = {
  update: async (data: any, headers: FetchHeaders, project: string) =>
    fetchPatch<ProjectConfigResult>(getProjectConfigEndpoint(project), data, {
      headers,
    }),

  getConfig: async (headers: FetchHeaders, project: string) =>
    fetchGet<ProjectConfigResult>(`${getProjectConfigEndpoint(project)}`, {
      headers,
    }),

  getMetadata: async (headers: FetchHeaders, project: string) =>
    fetchGet(`${getProjectConfigEndpoint(project)}/metadata`, { headers }),

  delete: async (headers: FetchHeaders, project: string) =>
    fetchDelete(`${getProjectConfigEndpoint(project)}/delete`, { headers }),
};
