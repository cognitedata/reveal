import { getAppUrl } from '@fusion/shared/cypress';

import { baseUrl, project, cluster } from '../config';

export function getUrl(appPath?: string, queryParams?: string): string {
  const path = `extpipes${appPath ? `${appPath}` : ''}`;
  return (
    getAppUrl(baseUrl, project, path, cluster) +
    (queryParams ? `&${queryParams}` : '')
  );
}
