import {
  GeospatialPostBody,
  GeospatialPostResponse,
} from '@cognite/discover-api-types';

import { FetchHeaders, fetchPost } from '../../../_helpers/fetch';
import { SIDECAR } from '../../../constants/app';

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
