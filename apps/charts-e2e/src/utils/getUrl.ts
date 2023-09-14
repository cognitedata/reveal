import { getAppUrl } from '@fusion/shared/cypress';

import { baseUrl, project, cluster } from '../config';

export function getUrl(): string {
  return getAppUrl(baseUrl, project, 'charts', cluster);
}
