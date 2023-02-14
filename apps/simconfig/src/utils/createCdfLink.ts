import { createLink } from '@cognite/cdf-utilities';

export const createCdfLink = (path: string, cluster?: string) => {
  const queryString = window.location.search;
  if (
    cluster &&
    !queryString.includes('cluster') &&
    !queryString.includes('env')
  ) {
    const parseCluster = cluster.startsWith('https')
      ? cluster.replace('https://', '')
      : cluster;
    const qs = new URLSearchParams({
      cluster: parseCluster,
      env: parseCluster.split('.')[0],
    }).toString();
    return createLink(`/simint${path}?${qs}`).replace(/\s+/g, '');
  }
  return createLink(`/simint${path}`).replace(/\s+/g, '');
};
