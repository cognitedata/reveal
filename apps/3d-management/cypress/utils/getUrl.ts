import { getAppUrl } from '@fusion/shared/cypress';

import { baseUrl, project, cluster } from '../config';

export function getUrl(appPath?: string): string {
  const path = `3d-models${appPath ? `${appPath}` : ''}`;
  return getAppUrl(baseUrl, project, path, cluster);
}
