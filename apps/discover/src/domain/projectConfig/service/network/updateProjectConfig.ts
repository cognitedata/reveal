import { FetchHeaders, fetchPatch } from 'utils/fetch';

import { getProjectConfigEndpoint } from '../utils/getProjectConfigEndpoint';

export const updateProjectConfig = async (
  data: any,
  headers: FetchHeaders,
  project: string
) =>
  fetchPatch(getProjectConfigEndpoint(project), data, {
    headers,
  });
