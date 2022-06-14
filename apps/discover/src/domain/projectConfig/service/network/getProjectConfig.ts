import { fetchGet, FetchHeaders } from 'utils/fetch';

import { ProjectConfig } from '@cognite/discover-api-types';

import { getProjectConfigEndpoint } from '../utils/getProjectConfigEndpoint';

export const getProjectConfig = async (
  headers: FetchHeaders,
  project: string
) =>
  fetchGet<ProjectConfig>(`${getProjectConfigEndpoint(project)}`, {
    headers,
  });
