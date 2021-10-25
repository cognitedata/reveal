import { FetchHeaders, fetchPost } from '../../../_helpers/fetch';
import { SIDECAR } from '../../../constants/app';

const getGeospatialEndpoint = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/geospatial`;

export const geospatial = {
  search: async <T>(payload: any, headers: FetchHeaders, project: string) =>
    fetchPost<T[]>(`${getGeospatialEndpoint(project)}/search`, payload, {
      headers,
    }),
};
