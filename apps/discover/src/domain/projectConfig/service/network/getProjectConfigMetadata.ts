import { fetchGet, FetchHeaders } from 'utils/fetch';

import { getProjectConfigEndpoint } from '../utils/getProjectConfigEndpoint';

export const getProjectConfigMetadata = async (
  headers: FetchHeaders,
  project: string
) => fetchGet(`${getProjectConfigEndpoint(project)}/metadata`, { headers });
