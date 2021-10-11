import { fetchGet, FetchHeaders, fetchPatch } from '../../../_helpers/fetch';
import { SIDECAR } from '../../../constants/app';

const getProjectConfigEndpoint = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/config`;

export const projectConfig = {
  update: async (data: any, headers: FetchHeaders, project: string) =>
    fetchPatch(getProjectConfigEndpoint(project), data, {
      headers,
    }),

  getConfig: async (headers: FetchHeaders, project: string) =>
    fetchGet(`${getProjectConfigEndpoint(project)}`, {
      headers,
    }),
};
