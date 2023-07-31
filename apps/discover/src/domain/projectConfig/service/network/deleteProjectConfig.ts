import { fetchDelete, FetchHeaders } from 'utils/fetch';

import { getProjectConfigEndpoint } from '../utils/getProjectConfigEndpoint';

export const deleteProjectConfig = async (
  headers: FetchHeaders,
  project: string
) => fetchDelete(`${getProjectConfigEndpoint(project)}/delete`, { headers });
