import {
  GeospatialPostBody,
  GeospatialPostResponse,
} from '@cognite/discover-api-types';

import { SIDECAR } from '../../constants/app';
import { FetchHeaders, fetchPost } from '../../utils/fetch';

const getGeospatialEndpoint = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/geospatial`;

export const geospatial = {
  search: async <T extends GeospatialPostResponse>(
    payload: GeospatialPostBody,
    headers: FetchHeaders,
    project: string
  ) =>
    fetchPost<T>(`${getGeospatialEndpoint(project)}/search`, payload, {
      headers,
    }),
};
