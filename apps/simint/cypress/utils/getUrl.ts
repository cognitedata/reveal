import { getAppUrl } from '@fusion/shared/cypress';

import { baseUrl, project, cluster } from '../config';

export function getUrl(subPath?: string): string {
  return getAppUrl(baseUrl, project, `simint${subPath ?? ''}`, cluster);
}
