import { isProduction } from 'models/charts/config/utils/environment';

export default function getServiceBaseUrl(cluster?: string) {
  const stagingPart = isProduction ? '' : 'staging';

  const domain = ['calculation-backend', stagingPart, cluster, 'cognite', 'ai']
    .filter(Boolean)
    .join('.');

  return `https://${domain}/v4`;
}
