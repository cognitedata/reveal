import { createLink, getProject } from '@cognite/cdf-utilities';

export const createCdfLink = (
  path: string,
  cluster?: string,
  searchParams?: URLSearchParams
) => {
  const project = getProject();
  const pathNameWithoutProject = window.location.pathname.replace(
    `/${project}`,
    ''
  );
  const pPath = path.startsWith('/')
    ? `/simint/${path}`
    : `${pathNameWithoutProject}/${path}`;
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
    return createLink(
      `${pPath}?${qs}${searchParams?.toString() ?? ''}`
    ).replace(/\s+/g, '');
  }
  return createLink(`${pPath}${searchParams?.toString() ?? ''}`).replace(
    /\s+/g,
    ''
  );
};
